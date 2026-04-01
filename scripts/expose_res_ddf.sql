-- ============================================================
-- Expose res_ddf schema to PostgREST
-- Run this in the Supabase SQL Editor to allow the JS client
-- to query res_ddf.listings via .schema('res_ddf')
-- ============================================================

-- Grant usage on the schema
GRANT USAGE ON SCHEMA res_ddf TO anon, authenticated, service_role;

-- Grant SELECT on all tables in the schema
GRANT SELECT ON ALL TABLES IN SCHEMA res_ddf TO anon, authenticated, service_role;

-- Make future tables accessible too
ALTER DEFAULT PRIVILEGES IN SCHEMA res_ddf
  GRANT SELECT ON TABLES TO anon, authenticated, service_role;

-- Notify PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the schema exists
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name IN ('res_ddf', 'geo_intel', 'public')
ORDER BY schema_name;
