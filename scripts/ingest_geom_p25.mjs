#!/usr/bin/env node
// ============================================================
// GeoIntelligence Engine — P2.5 Geometry Ingestion
// Converts ArcGIS geometries directly into PostGIS via GeoJSON
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qmsbvvnffaojddysvqmd.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtc2J2dm5mZmFvamRkeXN2cW1kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI0NzUxNiwiZXhwIjoyMDg3ODIzNTE2fQ.MN2_Vbgh-91jUxGzMsVm3dn0Oa4PdBRyULVSfxaltGc';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { db: { schema: 'geo_intel' } });

const ARCGIS_BASE = 'https://maps.ottawa.ca/arcgis/rest/services';

const ALL_LAYERS = [
  // Phase P1 (Complex Polygons)
  { service: 'Zoning/MapServer',                   layer: 3,  type: 'zoning' },
  { service: 'Zoning/MapServer',                   layer: 4,  type: 'heritage' },
  { service: 'Flooding/MapServer',                 layer: 11, type: 'flood_plain'},
  { service: 'Miscellaneous/MapServer',            layer: 4,  type: 'school' },
  { service: 'Neighbourhood_Planning_Areas/MapServer', layer: 0, type: 'neighbourhood' },
  { service: 'Wards/MapServer',                    layer: 0,  type: 'ward' },

  // Phase P2 (Transit/Parks/Amenities)
  { service: 'TransitServices/MapServer',          layer: 0,  type: 'transit_station' },
  { service: 'TransitServices/MapServer',          layer: 1,  type: 'otrain_station' },
  { service: 'Rail_Implementation_Office/MapServer', layer: 11, type: 'lrt_station' },
  { service: 'Rail_Implementation_Office/MapServer', layer: 32, type: 'lrt_stage2' },
  { service: 'Parks_Inventory/MapServer',          layer: 24, type: 'park' },
  { service: 'Parks_Inventory/MapServer',          layer: 5,  type: 'rec_facility' },
  { service: 'Parks_Inventory/MapServer',          layer: 0,  type: 'beach' },
  { service: 'Parks_Inventory/MapServer',          layer: 10, type: 'outdoor_pool' },
  { service: 'Parks_Inventory/MapServer',          layer: 18, type: 'splash_pad' },
  { service: 'Parks_Inventory/MapServer',          layer: 15, type: 'playground' },
  { service: 'Parks_Inventory/MapServer',          layer: 8,  type: 'dog_park' },
  { service: 'Parks_Inventory/MapServer',          layer: 21, type: 'tennis_court' },
  { service: 'Parks_Inventory/MapServer',          layer: 3,  type: 'basketball_court' },
  { service: 'Parks_Inventory/MapServer',          layer: 13, type: 'outdoor_rink' },
  { service: 'Parks_Inventory/MapServer',          layer: 16, type: 'skatepark' },
  { service: 'Parks_Inventory/MapServer',          layer: 27, type: 'pickleball_court' },
  { service: 'Recreation/MapServer',               layer: 1,  type: 'rec_centre' },
  { service: 'Community_Gardens/MapServer',        layer: 0,  type: 'community_garden' },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchAllFeatures(service, layerId) {
  const baseUrl = `${ARCGIS_BASE}/${service}/${layerId}/query`;
  const all = [];
  let offset = 0;
  const pageSize = 500;
  let hasMore = true;
  let retries = 0;

  while (hasMore) {
    const params = new URLSearchParams({
      where: '1=1',
      outFields: '*', // For properties to match DB code
      outSR: '4326',
      f: 'geojson',
      resultOffset: String(offset),
      resultRecordCount: String(pageSize),
    });

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);
      const res = await fetch(`${baseUrl}?${params}`, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) { console.error(`  ❌ HTTP ${res.status}`); break; }

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { retries++; if (retries > 2) break; await sleep(2000); continue; }

      if (data.features?.length > 0) {
        all.push(...data.features);
        process.stdout.write(`\r  📡 Fetched ${all.length}`);
        offset += pageSize;
        retries = 0;
        if (data.features.length < pageSize) hasMore = false;
      } else {
        hasMore = false;
      }
    } catch (err) {
      if (err.name === 'AbortError') console.error(`\n  ⏱️ Timeout at ${offset}`);
      retries++;
      if (retries > 2) break;
      await sleep(3000);
    }
  }

  console.log(`\n  ✅ ${all.length} features fetched`);
  return all;
}

async function processLayer(config) {
  console.log(`\n🔹 Processing geometries for: ${config.type}`);
  
  const features = await fetchAllFeatures(config.service, config.layer);
  if (features.length === 0) return 0;

  let updated = 0;
  const BATCH_SIZE = 50; 

  // We map features to pairs of (code, geom) to update existing rows
  for (let i = 0; i < features.length; i += BATCH_SIZE) {
    const batch = features.slice(i, i + BATCH_SIZE);
    
    // We update one by one for safety on massive multi-polygons, 
    // or we could use Promise.all.
    const promises = batch.map(f => {
      const props = f.properties || {};
      const code = String(
        props.ZONE_CODE || props.WARD_NUM || props.ONS_ID || 
        props.OBJECTID || props.ID || props.ASSET_ID || props.MAP_ID || ''
      );
      
      if (!f.geometry || !code) return Promise.resolve(null);

      return supabase.from('boundaries')
        .update({ geom: f.geometry })
        .eq('boundary_type', config.type)
        .eq('city', 'ottawa')
        .eq('code', code);
    });

    const results = await Promise.all(promises);
    
    // Check errors
    for (const r of results) {
       if (r && r.error) console.log(`  ❌ Update error: ${r.error.message.substring(0,60)}`);
       if (r && !r.error && r.data !== null) updated++;
    }

    process.stdout.write(`\r  💾 Updated geometries: ${updated}/${features.length}`);
  }

  console.log(`\n  ✅ Completed layer ${config.type}`);
  return updated;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  GeoIntelligence Engine — P2.5 PostGIS Translation  ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  
  for (const layer of ALL_LAYERS) {
    try {
      await processLayer(layer);
    } catch (e) {
      console.error(`\n  💀 Fatal error on ${layer.type}: ${e.message}`);
    }
  }

  console.log(`\n✅ All layers processed successfully!`);
}

main().catch(console.error);
