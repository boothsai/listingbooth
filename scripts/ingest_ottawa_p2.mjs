#!/usr/bin/env node
// ============================================================
// GeoIntelligence Engine — P2 Data Ingestion (Ottawa)
// Transit, Parks, Recreation, Community Amenities
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qmsbvvnffaojddysvqmd.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtc2J2dm5mZmFvamRkeXN2cW1kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI0NzUxNiwiZXhwIjoyMDg3ODIzNTE2fQ.MN2_Vbgh-91jUxGzMsVm3dn0Oa4PdBRyULVSfxaltGc';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { db: { schema: 'geo_intel' } });

const ARCGIS_BASE = 'https://maps.ottawa.ca/arcgis/rest/services';

// ============================================================
// P2 Endpoints — Transit + Parks + Recreation
// ============================================================
const AMENITY_LAYERS = [
  // Transit
  { service: 'TransitServices/MapServer',          layer: 0,  type: 'transit_station',   name: 'Transit Stations (BRT)' },
  { service: 'TransitServices/MapServer',          layer: 1,  type: 'otrain_station',    name: 'O-Train Stations' },
  { service: 'Rail_Implementation_Office/MapServer', layer: 11, type: 'lrt_station',     name: 'LRT Confederation Line Stations' },
  { service: 'Rail_Implementation_Office/MapServer', layer: 32, type: 'lrt_stage2',      name: 'LRT Stage 2 Stations' },
  // Parks
  { service: 'Parks_Inventory/MapServer',          layer: 24, type: 'park',              name: 'Parks & Greenspace' },
  { service: 'Parks_Inventory/MapServer',          layer: 5,  type: 'rec_facility',      name: 'Recreation Facilities' },
  { service: 'Parks_Inventory/MapServer',          layer: 0,  type: 'beach',             name: 'Beaches' },
  { service: 'Parks_Inventory/MapServer',          layer: 10, type: 'outdoor_pool',      name: 'Outdoor Pools' },
  { service: 'Parks_Inventory/MapServer',          layer: 18, type: 'splash_pad',        name: 'Splash Pads' },
  { service: 'Parks_Inventory/MapServer',          layer: 15, type: 'playground',        name: 'Play Areas' },
  { service: 'Parks_Inventory/MapServer',          layer: 8,  type: 'dog_park',          name: 'Dog Parks' },
  { service: 'Parks_Inventory/MapServer',          layer: 21, type: 'tennis_court',      name: 'Tennis Courts' },
  { service: 'Parks_Inventory/MapServer',          layer: 3,  type: 'basketball_court',  name: 'Basketball Courts' },
  { service: 'Parks_Inventory/MapServer',          layer: 13, type: 'outdoor_rink',      name: 'Outdoor Rinks' },
  { service: 'Parks_Inventory/MapServer',          layer: 16, type: 'skatepark',         name: 'Skate Parks' },
  { service: 'Parks_Inventory/MapServer',          layer: 27, type: 'pickleball_court',  name: 'Pickleball Courts' },
  // Recreation & Community
  { service: 'Recreation/MapServer',               layer: 1,  type: 'rec_centre',        name: 'Recreation Centres' },
  { service: 'Community_Gardens/MapServer',         layer: 0,  type: 'community_garden', name: 'Community Gardens' },
];

// ============================================================
// ArcGIS Paginated Fetch
// ============================================================
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
      outFields: '*',
      outSR: '4326',
      f: 'geojson',
      resultOffset: String(offset),
      resultRecordCount: String(pageSize),
    });

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(`${baseUrl}?${params}`, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) { console.error(`  ❌ HTTP ${res.status}`); break; }

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { retries++; if (retries > 2) break; await sleep(2000); continue; }

      if (data.features?.length > 0) {
        all.push(...data.features);
        process.stdout.write(`\r  📡 ${all.length} features`);
        offset += pageSize;
        retries = 0;
        if (data.features.length < pageSize) hasMore = false;
      } else {
        hasMore = false;
      }
    } catch (err) {
      if (err.name === 'AbortError') console.error(`\n  ⏱️  Timeout at ${offset}`);
      retries++;
      if (retries > 2) break;
      await sleep(3000);
    }
  }

  console.log(`\n  ✅ ${all.length} features`);
  return all;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================================
// Ingest Amenity Layer → geo_intel.boundaries
// ============================================================
async function ingestAmenityLayer(config) {
  console.log(`\n🔹 ${config.name} (${config.type})`);
  
  const features = await fetchAllFeatures(config.service, config.layer);
  if (features.length === 0) { console.log('  ⚠️  No features'); return 0; }

  // Clear existing
  await supabase.from('boundaries').delete().eq('boundary_type', config.type).eq('city', 'ottawa');

  let inserted = 0;
  const batchSize = 50;

  for (let i = 0; i < features.length; i += batchSize) {
    const batch = features.slice(i, i + batchSize).map(f => {
      const props = f.properties || {};
      const coords = f.geometry?.type === 'Point' 
        ? f.geometry.coordinates 
        : f.geometry?.type === 'Polygon' 
          ? getCentroid(f.geometry.coordinates[0])
          : f.geometry?.coordinates?.[0]?.[0] 
            ? getCentroid(f.geometry.coordinates[0])
            : null;

      return {
        boundary_type: config.type,
        city: 'ottawa',
        name: props.NAME_EN || props.NAME || props.PARK || props.FACILITY || props.STATION || props.GardenName || '',
        code: String(props.OBJECTID || props.ID || props.ASSET_ID || ''),
        geom: null,
        attributes: {
          ...props,
          lat: coords ? coords[1] : null,
          lng: coords ? coords[0] : null,
          _amenity_category: categorize(config.type),
          _has_geometry: !!f.geometry,
        },
        ingested_at: new Date().toISOString(),
      };
    });

    const { error } = await supabase.from('boundaries').insert(batch);
    if (error) {
      console.log(`\n  ❌ Batch ${i}: ${error.message.substring(0, 80)}`);
    } else {
      inserted += batch.length;
      process.stdout.write(`\r  📥 ${inserted}/${features.length}`);
    }
  }

  console.log(`\n  ✅ ${inserted} records inserted`);
  return inserted;
}

// ============================================================
// Helpers
// ============================================================
function getCentroid(coords) {
  if (!coords || coords.length === 0) return null;
  let sumLng = 0, sumLat = 0;
  for (const [lng, lat] of coords) {
    sumLng += lng;
    sumLat += lat;
  }
  return [sumLng / coords.length, sumLat / coords.length];
}

function categorize(type) {
  const transit = ['transit_station', 'otrain_station', 'lrt_station', 'lrt_stage2'];
  const parks = ['park', 'beach', 'dog_park', 'community_garden'];
  const sports = ['tennis_court', 'basketball_court', 'outdoor_rink', 'skatepark', 'pickleball_court'];
  const family = ['playground', 'splash_pad', 'outdoor_pool'];
  const rec = ['rec_facility', 'rec_centre'];
  
  if (transit.includes(type)) return 'transit';
  if (parks.includes(type)) return 'parks';
  if (sports.includes(type)) return 'sports';
  if (family.includes(type)) return 'family';
  if (rec.includes(type)) return 'recreation';
  return 'other';
}

// ============================================================
// Main
// ============================================================
async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║     GeoIntelligence Engine — P2 Ottawa Ingestion    ║');
  console.log('║     Transit · Parks · Recreation · Community        ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`\n⏱️  Started: ${new Date().toISOString()}\n`);

  const results = {};

  for (const config of AMENITY_LAYERS) {
    try {
      results[config.type] = await ingestAmenityLayer(config);
    } catch (e) {
      console.error(`  💀 ${config.type}: ${e.message}`);
      results[config.type] = 'FAILED';
    }
  }

  // Summary
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║              P2 INGESTION SUMMARY                   ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  let totalNew = 0;
  for (const [key, count] of Object.entries(results)) {
    const pad = key.padEnd(20);
    console.log(`║  ${pad} ${String(count).padStart(6)}  ║`);
    if (typeof count === 'number') totalNew += count;
  }
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  NEW P2 TOTAL          ${String(totalNew).padStart(6)}  ║`);
  console.log('╚══════════════════════════════════════════════════════╝');

  // Verify grand total
  const { count: grandTotal } = await supabase.from('boundaries').select('*', { count: 'exact', head: true });
  console.log(`\n📊 Grand total in database: ${grandTotal}`);
  console.log(`✅ Completed: ${new Date().toISOString()}`);
}

main().catch(err => {
  console.error('💀 Fatal:', err.message);
  process.exit(1);
});
