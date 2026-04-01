/**
 * Phase P5: Toronto GeoIntelligence Ingestion Engine
 * Pulls Toronto Open Data and TRCA Boundaries from ArcGIS and ingests into Supabase.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local from listingbooth root
dotenv.config({ path: path.join(__dirname, '../../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase Service Role Keys');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ArcGIS Endpoints (GeoJSON format, EPSG:4326)
const DATASETS = {
  toronto_zoning: {
    url: 'https://gis.toronto.ca/arcgis/rest/services/primary/cg_zoning_v2/MapServer/0/query',
    type: 'toronto_zoning',
    city: 'Toronto'
  },
  toronto_flood: {
    url: 'https://maps.trca.ca/server/rest/services/OpenData/OpenData/MapServer/6/query', // Estimated TRCA Floodplain layer
    type: 'toronto_flood',
    city: 'Toronto'
  },
  toronto_school: {
    url: 'https://services3.arcgis.com/xZQ1nO5bN64mrtw2/arcgis/rest/services/TDSB_School_Catchments/FeatureServer/0/query',
    type: 'toronto_school',
    city: 'Toronto'
  }
};

async function fetchArcGISPage(url: string, offset: number, batchSize: number): Promise<any> {
  const queryUrl = new URL(url);
  queryUrl.searchParams.append('where', '1=1');
  queryUrl.searchParams.append('outFields', '*');
  queryUrl.searchParams.append('f', 'geojson');
  queryUrl.searchParams.append('outSR', '4326');
  queryUrl.searchParams.append('resultOffset', offset.toString());
  queryUrl.searchParams.append('resultRecordCount', batchSize.toString());

  console.log(`[Fetch] ${queryUrl.toString()}`);
  
  const response = await fetch(queryUrl.toString(), {
    headers: { 'User-Agent': 'ListingBooth/GeoIntel-Ingest (Toronto P5)' }
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  return response.json();
}

async function ingestDataset(datasetKey: keyof typeof DATASETS) {
  const ds = DATASETS[datasetKey];
  console.log(`\n=== Starting Ingestion: ${ds.type} ===`);

  let offset = 0;
  const batchSize = 1000;
  let hasMore = true;
  let totalProcessed = 0;

  while (hasMore) {
    try {
      const geojson = await fetchArcGISPage(ds.url, offset, batchSize);

      if (!geojson || !geojson.features || geojson.features.length === 0) {
        console.log(`Completed ${ds.type}. Total features: ${totalProcessed}`);
        break;
      }

      const features = geojson.features;
      const recordsToInsert = features.map((f: any) => {
        // Build metadata dynamically depending on the dataset provided properties
        const props = f.properties || {};
        const code = props.ZONE_CD || props.ZONE_LBL || props.CODE || 'UNK';
        const name = props.DESC || props.NAME || props.ZONING_DESC || `${ds.type} Polygon`;

        return {
          boundary_type: ds.type,
          city: ds.city,
          name: name,
          code: code,
          attributes: props,
          // PostGIS handles GeoJSON native cast:
          geom: f.geometry
        };
      });

      // Insert directly into the Supabase PostGIS column using native JSON casting
      const { error } = await supabase
        .from('geo_intel.boundaries')
        .insert(recordsToInsert);

      if (error) {
        console.error(`[Error] Insert failed at offset ${offset}:`, error);
        break;
      }

      totalProcessed += features.length;
      console.log(`[Success] Inserted ${features.length} records. (Total: ${totalProcessed})`);
      
      offset += batchSize;
      
      // Safety delay to respect ArcGIS rate limits
      await new Promise(r => setTimeout(r, 1000));

    } catch (err) {
      console.error(`[Fatal Error] Failed requesting offset ${offset}:`, err);
      break;
    }
  }
}

async function main() {
  console.log('Initializing Toronto GeoIntelligence Engine...');
  
  // Wipe existing Toronto datasets to prevent overlapping duplicated polygons
  console.log('Clearing existing Toronto Geo_Shapes...');
  await supabase
    .from('geo_intel.boundaries')
    .delete()
    .in('boundary_type', ['toronto_zoning', 'toronto_flood', 'toronto_school']);

  // Sequentially ingest all 3 datasets
  await ingestDataset('toronto_zoning');
  await ingestDataset('toronto_flood');
  await ingestDataset('toronto_school');
  
  console.log('\n✅ Phase P5 Data Ingestion Successfully Completed.');
}

// Execute
main().catch(console.error);
