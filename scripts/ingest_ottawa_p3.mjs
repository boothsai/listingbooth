#!/usr/bin/env node
// ============================================================
// GeoIntelligence Engine — P3 Crime & Construction Ingestion
// Sources:
//   Crime: Ottawa Police FeatureServer (services1.arcgis.com)
//   Construction/Permits: Ottawa ConstructionForecastData MapServer
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qmsbvvnffaojddysvqmd.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtc2J2dm5mZmFvamRkeXN2cW1kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI0NzUxNiwiZXhwIjoyMDg3ODIzNTE2fQ.MN2_Vbgh-91jUxGzMsVm3dn0Oa4PdBRyULVSfxaltGc';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { db: { schema: 'geo_intel' } });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ──────────────────────────────────────────────────
// Generic paginated ArcGIS fetcher (supports both FeatureServer + MapServer)
// ──────────────────────────────────────────────────
async function fetchAllFeatures(baseQueryUrl, where = '1=1') {
  const all = [];
  let offset = 0;
  const pageSize = 1000;
  let hasMore = true;
  let retries = 0;

  while (hasMore) {
    const params = new URLSearchParams({
      where,
      outFields: '*',
      outSR: '4326',
      f: 'geojson',
      resultOffset: String(offset),
      resultRecordCount: String(pageSize),
    });

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);
      const res = await fetch(`${baseQueryUrl}?${params}`, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) { console.error(`  ❌ HTTP ${res.status}`); break; }
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { retries++; if (retries > 2) break; await sleep(2000); continue; }

      if (data.features?.length > 0) {
        all.push(...data.features);
        process.stdout.write(`\r  📡 ${all.length} records fetched`);
        offset += pageSize;
        retries = 0;
        if (data.features.length < pageSize) hasMore = false;
      } else {
        hasMore = false;
      }
    } catch (err) {
      retries++;
      if (retries > 2) break;
      await sleep(3000);
    }
  }
  console.log(`\n  ✅ Total: ${all.length}`);
  return all;
}

// ──────────────────────────────────────────────────
// 1. CRIME DATA (Ottawa Police — CrimeLocations Layer 3)
// ──────────────────────────────────────────────────
async function ingestCrime() {
  console.log('\n🔴 Ingesting Crime Data (Ottawa Police Service)...');

  const featureUrl = 'https://services1.arcgis.com/TTAKhneQUzcgqBHm/arcgis/rest/services/PoliceCrimeandStations/FeatureServer/3/query';
  const features = await fetchAllFeatures(featureUrl);
  if (features.length === 0) return;

  // Clear old crime data
  await supabase.from('boundaries').delete().eq('boundary_type', 'crime').eq('city', 'ottawa');

  let inserted = 0;
  const batchSize = 200;

  for (let i = 0; i < features.length; i += batchSize) {
    const batch = features.slice(i, i + batchSize).map(f => {
      const p = f.properties || {};
      return {
        boundary_type: 'crime',
        city: 'ottawa',
        name: p.rucr_desc || p.rext_desc || 'Unknown',
        code: String(p.OBJECTID || ''),
        geom: f.geometry || null,
        attributes: {
          offence_code: p.rucr,
          offence_desc: p.rucr_desc,
          offence_ext: p.rext_desc,
          occurrence_date: p.from_occ_d,
          report_date: p.report_dat || p.report_date,
          district: p.district,
          zone: p.zone_,
          community: p.COMMUNITY,
          road_name: p.DISPLAYNAM || p.NAME,
          person_count: p.person_cou,
          vehicle_count: p.vehicle_co,
        },
        ingested_at: new Date().toISOString(),
      };
    });

    const { error } = await supabase.from('boundaries').insert(batch);
    if (error) {
      console.log(`\n  ❌ Batch Error: ${error.message.substring(0, 80)}`);
    } else {
      inserted += batch.length;
      process.stdout.write(`\r  📥 ${inserted}/${features.length}`);
    }
  }
  console.log(`\n  ✅ Crime data ingested: ${inserted} records`);
}

// ──────────────────────────────────────────────────
// 2. CONSTRUCTION / BUILDING PERMITS (Ottawa ConstructionForecastData)
// ──────────────────────────────────────────────────
async function ingestConstruction() {
  console.log('\n🔵 Ingesting Construction Forecasts (Building Permits proxy)...');

  const featureUrl = 'https://maps.ottawa.ca/arcgis/rest/services/ConstructionForecastData/MapServer/0/query';
  const features = await fetchAllFeatures(featureUrl);
  if (features.length === 0) return;

  await supabase.from('boundaries').delete().eq('boundary_type', 'building_permit').eq('city', 'ottawa');

  let inserted = 0;
  const batchSize = 50; // Smaller for polygon geometries

  for (let i = 0; i < features.length; i += batchSize) {
    const batch = features.slice(i, i + batchSize).map(f => {
      const p = f.properties || {};
      return {
        boundary_type: 'building_permit',
        city: 'ottawa',
        name: p.DESCRIPTION_EN || p.DESCRIPTIO || p.NAME_EN || 'Construction Activity',
        code: String(p.OBJECTID || ''),
        geom: f.geometry || null,
        attributes: {
          description: p.DESCRIPTION_EN || p.DESCRIPTIO,
          start_date: p.START_DATE || p.PLANNED_START,
          end_date: p.END_DATE || p.PLANNED_END,
          status: p.STATUS_EN || p.STATUS,
          contractor: p.CONTRACTOR_EN || p.CONTRACTOR,
          ward: p.WARD_EN || p.WARD,
          road_name: p.ROAD_NAME_EN || p.ROAD_NAME,
          project_type: p.PROJECT_TYPE_EN || p.TYPE_EN || p.TYPE,
          lat: f.geometry?.coordinates?.[1] || f.geometry?.coordinates?.[0]?.[0]?.[1],
          lng: f.geometry?.coordinates?.[0] || f.geometry?.coordinates?.[0]?.[0]?.[0],
        },
        ingested_at: new Date().toISOString(),
      };
    });

    const { error } = await supabase.from('boundaries').insert(batch);
    if (error) {
      console.log(`\n  ❌ Batch Error: ${error.message.substring(0, 80)}`);
    } else {
      inserted += batch.length;
      process.stdout.write(`\r  📥 ${inserted}/${features.length}`);
    }
  }
  console.log(`\n  ✅ Construction/Permits ingested: ${inserted} records`);
}

// ──────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  GeoIntel Phase P3 — Crime & Construction Pipeline  ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  await ingestCrime();
  await ingestConstruction();

  // Final inventory check
  const { count: total } = await supabase.from('boundaries').select('*', { count: 'exact', head: true });
  console.log(`\n🏁 Total geo_intel.boundaries inventory: ${total} records`);
}

main().catch(console.error);
