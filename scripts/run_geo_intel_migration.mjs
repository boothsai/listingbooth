// GeoIntelligence Engine — P0 Schema Migration Runner
// Executes the geo_intel schema via Supabase's postgrest-compatible approach
// Usage: node scripts/run_geo_intel_migration.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://qmsbvvnffaojddysvqmd.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtc2J2dm5mZmFvamRkeXN2cW1kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI0NzUxNiwiZXhwIjoyMDg3ODIzNTE2fQ.MN2_Vbgh-91jUxGzMsVm3dn0Oa4PdBRyULVSfxaltGc';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Split SQL into individual statements and execute sequentially
const sqlFile = readFileSync('scripts/geo_intel_schema.sql', 'utf-8');

// Split on semicolons but skip comments and empty lines
const statements = sqlFile
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--') && s.length > 5);

console.log(`\n🌍 GeoIntelligence Engine — P0 Schema Migration`);
console.log(`   Found ${statements.length} SQL statements to execute\n`);

let success = 0;
let failed = 0;

for (const stmt of statements) {
  // Extract a short label
  const label = stmt.split('\n').find(l => l.trim() && !l.trim().startsWith('--'))?.trim().slice(0, 60) || 'unknown';

  try {
    const { data, error } = await supabase.rpc('exec_sql', { query: stmt + ';' });
    if (error) {
      // If exec_sql doesn't exist, we'll need the Management API approach
      throw new Error(error.message);
    }
    console.log(`   ✅ ${label}...`);
    success++;
  } catch (err) {
    // Try the Supabase Management API (requires project ref + service key)
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'GET',
        headers: { 'apikey': SERVICE_ROLE_KEY }
      });
      // This approach won't work for DDL. Mark as needing manual execution.
      console.log(`   ⚠️  ${label}... (needs SQL Editor)`);
      failed++;
    } catch (e2) {
      console.log(`   ❌ ${label}... ${err.message}`);
      failed++;
    }
  }
}

console.log(`\n📊 Results: ${success} succeeded, ${failed} need manual execution`);

if (failed > 0) {
  console.log(`\n⚠️  Some statements couldn't be executed via API.`);
  console.log(`   Please run the full SQL file in Supabase SQL Editor:`);
  console.log(`   1. Go to: https://supabase.com/dashboard/project/qmsbvvnffaojddysvqmd/sql`);
  console.log(`   2. Open: scripts/geo_intel_schema.sql`);
  console.log(`   3. Click "Run" to execute all statements\n`);
  console.log(`   The SQL file is ready at: scripts/geo_intel_schema.sql`);
}
