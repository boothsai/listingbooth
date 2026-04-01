/**
 * Phase P5: Toronto GeoIntelligence Ingestion Engine
 * 
 * Strategy: Download large GeoJSON files to disk first, then stream-parse
 * and batch-insert into Supabase via the geo_intel_insert_boundary RPC.
 * 
 * Usage: node --env-file=.env.local scripts/toronto-ingest.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing env vars.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: { schema: 'geo_intel' }
});

const CACHE_DIR = join(process.cwd(), '.geo-cache');
if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR);

// ── Verified Toronto Open Data Endpoints ──────────────────────
const DATASETS = {
  toronto_zoning: {
    name: 'Toronto Zoning By-Law Areas',
    url: 'https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/34927e44-fc11-4336-a8aa-a0dfb27658b7/resource/d75fa1ed-cd04-4a0b-bb6d-2b928ffffa6e/download/zoning-area-4326.geojson',
    type: 'toronto_zoning',
    city: 'Toronto',
    codeField: 'GEN_ZONE',
    nameField: 'ZBL_ZONE_S',
    filename: 'zoning-area-4326.geojson',
  },
  toronto_neighbourhood: {
    name: 'Toronto Neighbourhoods (158)',
    // Use the CKAN datastore cache download which is more reliable
    url: 'https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/neighbourhoods/download/Neighbourhoods%20-%204326.geojson',
    type: 'toronto_neighbourhood',
    city: 'Toronto',
    codeField: 'AREA_SHORT_CODE',
    nameField: 'AREA_NAME',
    filename: 'neighbourhoods-4326.geojson',
  },
};

// ── Download to disk ─────────────────────────────────────────
async function downloadFile(url, filename) {
  const filepath = join(CACHE_DIR, filename);
  if (existsSync(filepath)) {
    console.log(`  📂 Using cached: ${filename}`);
    return filepath;
  }
  console.log(`  ⬇️  Downloading ${filename}...`);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'ListingBooth/GeoIntel-P5' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(filepath, buffer);
  console.log(`  💾 Saved: ${(buffer.length / 1024 / 1024).toFixed(1)} MB`);
  return filepath;
}

// ── Main Ingestion Pipeline ──────────────────────────────────
async function ingestDataset(key) {
  const ds = DATASETS[key];
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📦 ${ds.name}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  // Step 1: Download
  const filepath = await downloadFile(ds.url, ds.filename);

  // Step 2: Parse (stream-friendly for large files)
  console.log(`  🔍 Parsing GeoJSON...`);
  const raw = readFileSync(filepath, 'utf-8');
  const geojson = JSON.parse(raw);
  const features = geojson.features || [];
  console.log(`  ✅ Parsed ${features.length} features`);

  if (features.length === 0) return;

  // Step 3: Clear existing layer data
  console.log(`  🗑️  Clearing existing ${ds.type}...`);
  await supabase.rpc('geo_intel_delete_layer', { p_layer_type: ds.type });

  // Step 4: Batch insert via RPC
  let inserted = 0;
  let errors = 0;
  const CONCURRENCY = 5; // parallel inserts per batch

  for (let i = 0; i < features.length; i += CONCURRENCY) {
    const batch = features.slice(i, i + CONCURRENCY);
    const promises = batch.map(f => {
      const props = f.properties || {};
      return supabase.rpc('geo_intel_insert_boundary', {
        p_boundary_type: ds.type,
        p_city: ds.city,
        p_name: String(props[ds.nameField] || ds.type).substring(0, 255),
        p_code: String(props[ds.codeField] || 'UNK').substring(0, 50),
        p_attributes: props,
        p_geojson: JSON.stringify(f.geometry),
      });
    });

    const results = await Promise.all(promises);
    for (const r of results) {
      if (r.error) {
        errors++;
        if (errors <= 3) console.error(`\n  ⚠️  ${r.error.message}`);
      } else {
        inserted++;
      }
    }

    const pct = Math.round(((i + batch.length) / features.length) * 100);
    process.stdout.write(`\r  📥 Progress: ${inserted}/${features.length} (${pct}%) [${errors} errors]`);
  }

  console.log(`\n  ✅ Done: ${inserted} inserted, ${errors} errors`);
}

// ── Entry Point ──────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  Phase P5: Toronto GeoIntel Ingestion    ║');
  console.log('╚══════════════════════════════════════════╝');

  for (const key of Object.keys(DATASETS)) {
    await ingestDataset(key);
  }

  // Final verification
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔎 Verification: CN Tower (43.6426, -79.3871)');
  const { data, error } = await supabase.rpc('get_boundaries_intersecting', {
    search_lng: -79.3871,
    search_lat: 43.6426,
    layer_type: 'zoning'
  });
  if (error) {
    console.log(`  ❌ ${error.message}`);
  } else {
    console.log(`  ✅ Found ${data.length} zone(s): ${data.map(d => d.code).join(', ')}`);
  }

  console.log('\n🏁 Phase P5 Complete!');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
