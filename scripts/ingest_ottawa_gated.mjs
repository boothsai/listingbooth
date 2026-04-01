#!/usr/bin/env node
// ============================================================
// GeoIntelligence Engine — P3 Gated Data Ingestion
// Ingests High-Value Development Applications into PostGIS
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qmsbvvnffaojddysvqmd.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtc2J2dm5mZmFvamRkeXN2cW1kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI0NzUxNiwiZXhwIjoyMDg3ODIzNTE2fQ.MN2_Vbgh-91jUxGzMsVm3dn0Oa4PdBRyULVSfxaltGc';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { db: { schema: 'geo_intel' } });

const ARCGIS_BASE = 'https://maps.ottawa.ca/arcgis/rest/services';

const GATED_LAYERS = [
  { service: 'Development_Applications/MapServer', layer: 0, type: 'dev_app', name: 'Active Development Applications' },
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
      where: "OBJECT_CURRENT_STATUS_EN NOT IN ('Completed', 'Closed')", // Only get active
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
      try { data = JSON.parse(text); } catch { retries++; if(retries>2)break; await sleep(2000); continue; }

      if (data.features?.length > 0) {
        all.push(...data.features);
        process.stdout.write(`\r  📡 ${all.length} applications fetched`);
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
  console.log(`\n  ✅ Total Active Applications: ${all.length}`);
  return all;
}

async function ingestGatedLayer(config) {
  console.log(`\n🔹 Intelligently Syncing: ${config.name} (${config.type})`);
  
  const features = await fetchAllFeatures(config.service, config.layer);
  if (features.length === 0) return 0;

  // Clear existing entries for fresh sync
  await supabase.from('boundaries').delete().eq('boundary_type', config.type).eq('city', 'ottawa');

  let inserted = 0;
  const batchSize = 100;

  for (let i = 0; i < features.length; i += batchSize) {
    const batch = features.slice(i, i + batchSize).map(f => {
      const p = f.properties || {};
      
      const geom = f.geometry || null; 
      
      return {
        boundary_type: config.type,
        city: 'ottawa',
        name: (p.APPLICATION_NUMBER || '').trim(),
        code: String(p.OBJECTID || p.APPLICATION_NUMBER || ''),
        geom: geom,
        attributes: {
          app_type: p.APPLICATION_TYPE_EN,
          status: p.OBJECT_CURRENT_STATUS_EN,
          description: p.DESCRIPTION_EN,
          address: p.ADDRESS_EN,
          submitted_date: p.DATE_SUBMITTED ? new Date(p.DATE_SUBMITTED).toISOString() : null,
          lat: p.LATITUDE,
          lng: p.LONGITUDE
        },
        ingested_at: new Date().toISOString(),
      };
    });

    const { error } = await supabase.from('boundaries').insert(batch);
    if (error) {
      console.log(`\n  ❌ Batch Error: ${error.message.substring(0,80)}`);
    } else {
      inserted += batch.length;
      process.stdout.write(`\r  📥 Inserted ${inserted}/${features.length} records into PostGIS`);
    }
  }

  console.log(`\n  ✅ Completed ingestion of ${config.type}`);
  return inserted;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  GeoIntel Phase P3 — Gated Datasets Ingestion       ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  
  for (const config of GATED_LAYERS) {
    await ingestGatedLayer(config);
  }
}

main().catch(err => console.error(err));
