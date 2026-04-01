// Execute the core_logic schema exposure SQL via Supabase Management API
import 'dotenv/config';

const SUPABASE_URL = 'https://qmsbvvnffaojddysvqmd.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const statements = [
  "GRANT USAGE ON SCHEMA core_logic TO anon, authenticated, service_role",
  "GRANT SELECT ON ALL TABLES IN SCHEMA core_logic TO anon, authenticated, service_role",
  "GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA core_logic TO service_role",
  "ALTER DEFAULT PRIVILEGES IN SCHEMA core_logic GRANT SELECT ON TABLES TO anon, authenticated, service_role",
  "ALTER DEFAULT PRIVILEGES IN SCHEMA core_logic GRANT INSERT, UPDATE, DELETE ON TABLES TO service_role",
  "ALTER ROLE authenticator SET pgrst.db_schemas = 'public, geo_intel, core_logic'",
  "NOTIFY pgrst, 'reload config'",
  "NOTIFY pgrst, 'reload schema'"
];

async function run() {
  for (const sql of statements) {
    console.log('Executing:', sql.substring(0, 60) + '...');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });
    
    if (!res.ok) {
      // Try via the pg_net approach or just log
      console.log(`  Status: ${res.status} — ${await res.text()}`);
    } else {
      console.log('  ✅ OK');
    }
  }
}

run().catch(console.error);
