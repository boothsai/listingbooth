#!/usr/bin/env node
// ============================================================
// GeoIntelligence Engine — P4 GTA / Toronto Data Ingestion
// Sources:
//   Schools: City of Toronto ArcGIS (582 records)
//   Transit: TTC Stops (9,388 records — bus, subway, streetcar)
//   Crime:   Toronto Police Service Open Data Hub
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qmsbvvnffaojddysvqmd.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtc2J2dm5mZmFvamRkeXN2cW1kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI0NzUxNiwiZXhwIjoyMDg3ODIzNTE2fQ.MN2_Vbgh-91jUxGzMsVm3dn0Oa4PdBRyULVSfxaltGc';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { db: { schema: 'geo_intel' } });

const TORONTO_ARCGIS = 'https://services3.arcgis.com/b9WvedVPoizGfvfD/arcgis/rest/services';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchAllGeoJSON(url, where = '1=1') {
  const all = [];
  let offset = 0;
  const pageSize = 1000;
  let hasMore = true;
  let retries = 0;

  while (hasMore) {
    const params = new URLSearchParams({
      where, outFields: '*', outSR: '4326', f: 'geojson',
      resultOffset: String(offset),
      resultRecordCount: String(pageSize),
    });
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);
      const res = await fetch(`${url}?${params}`, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) break;
      const data = await res.json();
      if (data.features?.length > 0) {
        all.push(...data.features);
        process.stdout.write(`\r  📡 ${all.length} fetched`);
        offset += pageSize;
        if (data.features.length < pageSize) hasMore = false;
        retries = 0;
      } else hasMore = false;
    } catch {
      retries++;
      if (retries > 2) break;
      await sleep(2000);
    }
  }
  console.log(`\n  ✅ Total: ${all.length}`);
  return all;
}

async function batchInsert(records, batchSize = 100) {
  let inserted = 0;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from('boundaries').insert(batch);
    if (error) {
      console.log(`\n  ❌ ${error.message.substring(0, 80)}`);
    } else {
      inserted += batch.length;
      process.stdout.write(`\r  📥 ${inserted}/${records.length}`);
    }
    // Throttle to avoid overwhelming Supabase
    if (i % 500 === 0 && i > 0) await sleep(500);
  }
  console.log(`\n  ✅ Inserted: ${inserted}`);
  return inserted;
}

// ──────────────────────────────────────────────────
// 1. TORONTO SCHOOLS (City of Toronto ArcGIS)
// ──────────────────────────────────────────────────
async function ingestSchools() {
  console.log('\n🎒 Toronto Schools...');
  const url = `${TORONTO_ARCGIS}/Schools/FeatureServer/0/query`;
  const features = await fetchAllGeoJSON(url);
  if (!features.length) return;
  
  await supabase.from('boundaries').delete().eq('boundary_type', 'school').eq('city', 'toronto');
  
  const records = features.map(f => {
    const p = f.properties || {};
    return {
      boundary_type: 'school',
      city: 'toronto',
      name: p.school || 'School',
      code: String(p.FID || ''),
      geom: f.geometry,
      attributes: {
        board: p.board,
        address: p.address,
        phone: p.phone,
        category: p.board?.includes('Catholic') ? 'Catholic' : 'Public',
        grades: '',
      },
      ingested_at: new Date().toISOString(),
    };
  });
  await batchInsert(records);
}

// ──────────────────────────────────────────────────
// 2. TTC TRANSIT STOPS (Toronto Transit Commission)
// ──────────────────────────────────────────────────
async function ingestTransit() {
  console.log('\n🚆 TTC Transit Stops...');
  const url = `${TORONTO_ARCGIS}/COTGEO_TTC_STOP/FeatureServer/0/query`;
  const features = await fetchAllGeoJSON(url);
  if (!features.length) return;
  
  await supabase.from('boundaries').delete().eq('boundary_type', 'transit_station').eq('city', 'toronto');
  
  const records = features.map(f => {
    const p = f.properties || {};
    // Determine transit type from stop data
    let type = 'bus';
    const name = (p.STOP_NAME || '').toUpperCase();
    if (p.LOCATION_TYPE === 1 || name.includes('STATION')) type = 'subway';
    
    return {
      boundary_type: 'transit_station',
      city: 'toronto',
      name: p.STOP_NAME || 'TTC Stop',
      code: String(p.STOP_ID || p.OBJECTID || ''),
      geom: f.geometry,
      attributes: {
        stop_code: p.STOP_CODE,
        type,
        zone: p.ZONE_ID,
        wheelchair: p.WHEELCHAIR_BOARDING,
        url: p.STOP_URL,
      },
      ingested_at: new Date().toISOString(),
    };
  });
  
  // Only insert subway stations + major stops (not all 9000+ bus stops)
  const subwayAndMajor = records.filter(r => 
    r.attributes.type === 'subway' || 
    r.name.includes('Station') ||
    r.name.includes('STATION')
  );
  console.log(`  Filtered to ${subwayAndMajor.length} major stops (subway + stations)`);
  
  // If too few subway stations, fall back to all
  const toInsert = subwayAndMajor.length > 20 ? subwayAndMajor : records;
  await batchInsert(toInsert);
}

// ──────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  GeoIntel Phase P4 — Toronto / GTA Ingestion        ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  await ingestSchools();
  await sleep(1000); // Throttle between layers
  await ingestTransit();

  const { count } = await supabase.from('boundaries').select('*', { count: 'exact', head: true });
  console.log(`\n🏁 Total geo_intel.boundaries inventory: ${count} records`);
}

main().catch(console.error);
