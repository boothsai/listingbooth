#!/usr/bin/env node
// ============================================================
// GeoIntelligence Engine — P1 Data Ingestion (Ottawa)
// Ingests zoning, flood, schools, neighbourhoods, wards
// from Ottawa ArcGIS REST into Supabase geo_intel schema
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qmsbvvnffaojddysvqmd.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtc2J2dm5mZmFvamRkeXN2cW1kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI0NzUxNiwiZXhwIjoyMDg3ODIzNTE2fQ.MN2_Vbgh-91jUxGzMsVm3dn0Oa4PdBRyULVSfxaltGc';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { db: { schema: 'geo_intel' } });

const ARCGIS_BASE = 'https://maps.ottawa.ca/arcgis/rest/services';

// Endpoint map — discovered from the services directory
const LAYERS = {
  zoning:          { service: 'Zoning/MapServer',         layer: 3, type: 'zoning' },
  flood_plain:     { service: 'Zoning/MapServer',         layer: 0, type: 'flood_plain' },
  heritage:        { service: 'Zoning/MapServer',         layer: 1, type: 'heritage' },
  neighbourhoods:  { service: 'Neighbourhoods/MapServer',  layer: 2, type: 'neighbourhood' },
  wards:           { service: 'Wards/MapServer',           layer: 0, type: 'ward' },
};

const SCHOOL_LAYERS = {
  by_board:    { service: 'Schools/MapServer', layer: 0 },
};

// Skip layers that already succeeded (set to true after first successful run)
const SKIP = {
  zoning: true, // Already ingested 14,061 features
};

// ============================================================
// ArcGIS REST Helper — paginated GeoJSON fetch with timeout
// ============================================================
async function fetchAllFeatures(service, layerId, outFields = '*') {
  const baseUrl = `${ARCGIS_BASE}/${service}/${layerId}/query`;
  const allFeatures = [];
  let offset = 0;
  const pageSize = 500; // Smaller pages for complex geometries
  let hasMore = true;
  let retries = 0;
  const maxRetries = 3;

  console.log(`   📡 Fetching ${service}/${layerId}...`);

  while (hasMore) {
    const params = new URLSearchParams({
      where: '1=1',
      outFields,
      outSR: '4326',
      f: 'geojson',
      resultOffset: String(offset),
      resultRecordCount: String(pageSize),
    });

    const url = `${baseUrl}?${params}`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        console.error(`   ❌ HTTP ${res.status} from ${service}/${layerId}`);
        break;
      }

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error(`   ❌ JSON parse error at offset ${offset}, retrying...`);
        retries++;
        if (retries >= maxRetries) break;
        await sleep(2000);
        continue;
      }

      if (data.features && data.features.length > 0) {
        allFeatures.push(...data.features);
        process.stdout.write(`\r      ... fetched ${allFeatures.length} features`);
        offset += pageSize;
        retries = 0;

        if (data.features.length < pageSize) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.error(`\n   ⏱️  Timeout at offset ${offset}, retrying...`);
      } else {
        console.error(`\n   ❌ Fetch error: ${err.message}`);
      }
      retries++;
      if (retries >= maxRetries) {
        console.error(`   💀 Max retries hit at offset ${offset}`);
        break;
      }
      await sleep(3000);
    }
  }

  console.log(`\n   ✅ Total: ${allFeatures.length} features`);
  return allFeatures;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================================
// Boundary Ingestion (polygons → geo_intel.boundaries)
// ============================================================
async function ingestBoundaries(layerKey) {
  const config = LAYERS[layerKey];
  console.log(`\n🗺️  Ingesting ${layerKey} (${config.type})...`);

  if (SKIP[layerKey]) {
    console.log(`   ⏭️  Skipping ${layerKey} (already ingested)`);
    return -1;
  }

  const features = await fetchAllFeatures(config.service, config.layer);
  if (features.length === 0) {
    console.log(`   ⚠️  No features found for ${layerKey}`);
    return 0;
  }

  // Clear existing data for this boundary type
  const { error: delErr } = await supabase
    .from('boundaries')
    .delete()
    .eq('boundary_type', config.type)
    .eq('city', 'ottawa');
  
  if (delErr) console.log(`   ⚠️  Delete: ${delErr.message}`);

  // Batch insert — store geometry as JSON in attributes (PostGIS conversion later via SQL)
  let inserted = 0;
  const batchSize = 25; // Smaller batches for large geometries

  for (let i = 0; i < features.length; i += batchSize) {
    const batch = features.slice(i, i + batchSize).map(f => {
      const props = f.properties || {};
      
      let name = props.NAME_EN || props.ONS_NAME || props.WARD_EN || props.LABEL_EN || props.ZONE_CODE || '';
      let code = props.ZONE_CODE || props.WARD_NUM || props.ONS_ID || '';

      // Store raw geometry in attributes for later PostGIS conversion
      const attributes = { ...props };
      if (f.geometry) {
        attributes._geojson_type = f.geometry.type;
        // Only store simplified coordinate count, not full coords (too large for JSONB)
        attributes._has_geometry = true;
        attributes._coord_count = JSON.stringify(f.geometry).length;
      }

      return {
        boundary_type: config.type,
        city: 'ottawa',
        name: String(name).substring(0, 500),
        code: String(code).substring(0, 100),
        geom: null, // We'll convert via SQL batch later
        attributes,
        ingested_at: new Date().toISOString(),
      };
    });

    try {
      const { error } = await supabase.from('boundaries').insert(batch);
      if (error) {
        console.log(`\n   ❌ Insert batch ${i}: ${error.message.substring(0, 100)}`);
      } else {
        inserted += batch.length;
        process.stdout.write(`\r   📥 Inserted ${inserted}/${features.length}`);
      }
    } catch (e) {
      console.log(`\n   ❌ Exception batch ${i}: ${e.message.substring(0, 100)}`);
    }
  }

  console.log(`\n   ✅ Inserted ${inserted} ${config.type} boundaries`);
  return inserted;
}

// ============================================================
// School Ingestion
// ============================================================
async function ingestSchools() {
  console.log(`\n🎒 Ingesting Ottawa schools...`);

  const features = await fetchAllFeatures(
    SCHOOL_LAYERS.by_board.service,
    SCHOOL_LAYERS.by_board.layer,
    '*'
  );

  if (features.length === 0) {
    console.log(`   ⚠️  No school features found`);
    return 0;
  }

  // Clear existing
  await supabase.from('boundaries').delete().eq('boundary_type', 'school').eq('city', 'ottawa');

  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < features.length; i += batchSize) {
    const batch = features.slice(i, i + batchSize).map(f => {
      const props = f.properties || {};
      const coords = f.geometry?.coordinates;
      
      return {
        boundary_type: 'school',
        city: 'ottawa',
        name: props.NAME_EN || props.NAME || props.SCHOOL || '',
        code: String(props.SCHOOL_ID || props.OBJECTID || ''),
        geom: null,
        attributes: {
          ...props,
          lat: coords ? coords[1] : null,
          lng: coords ? coords[0] : null,
          school_board: props.BOARD_EN || props.BOARD || '',
          category: props.CATEGORY_EN || props.CATEGORY || '',
          grades: props.GRADE_RANGE || '',
          address: props.ADDRESS || '',
        },
        ingested_at: new Date().toISOString(),
      };
    });

    const { error } = await supabase.from('boundaries').insert(batch);
    if (error) {
      console.log(`\n   ❌ Insert batch ${i}: ${error.message.substring(0, 100)}`);
    } else {
      inserted += batch.length;
      process.stdout.write(`\r   📥 Inserted ${inserted}/${features.length} schools`);
    }
  }

  console.log(`\n   ✅ Inserted ${inserted} schools`);
  return inserted;
}

// ============================================================
// Main
// ============================================================
async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  GeoIntelligence Engine — P1 Ottawa Data Ingestion  ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`\n⏱️  Started at: ${new Date().toISOString()}\n`);

  const results = {};

  try { results.zoning = await ingestBoundaries('zoning'); } catch(e) { console.error('zoning error:', e.message); results.zoning = 'FAILED'; }
  try { results.flood_plain = await ingestBoundaries('flood_plain'); } catch(e) { console.error('flood error:', e.message); results.flood_plain = 'FAILED'; }
  try { results.heritage = await ingestBoundaries('heritage'); } catch(e) { console.error('heritage error:', e.message); results.heritage = 'FAILED'; }
  try { results.neighbourhoods = await ingestBoundaries('neighbourhoods'); } catch(e) { console.error('neighbourhood error:', e.message); results.neighbourhoods = 'FAILED'; }
  try { results.wards = await ingestBoundaries('wards'); } catch(e) { console.error('wards error:', e.message); results.wards = 'FAILED'; }
  try { results.schools = await ingestSchools(); } catch(e) { console.error('schools error:', e.message); results.schools = 'FAILED'; }

  // Summary
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║              P1 INGESTION SUMMARY                   ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  for (const [key, count] of Object.entries(results)) {
    const pad = key.padEnd(20);
    const val = count === -1 ? '  SKIP' : String(count).padStart(6);
    console.log(`║  ${pad} ${val} features  ║`);
  }
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`\n✅ Completed at: ${new Date().toISOString()}`);

  // Verify total count
  const { count } = await supabase.from('boundaries').select('*', { count: 'exact', head: true });
  console.log(`\n📊 Total boundaries in database: ${count}`);
}

main().catch(err => {
  console.error('💀 Fatal error:', err.message);
  process.exit(1);
});
