-- Expose core_logic schema to PostgREST API
-- This allows the Supabase JS client to access tables via .schema('core_logic')

-- 1. Grant usage on the schema to the API roles
GRANT USAGE ON SCHEMA core_logic TO anon, authenticated, service_role;

-- 2. Grant SELECT on all existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA core_logic TO anon, authenticated, service_role;

-- 3. Grant INSERT/UPDATE/DELETE for service_role (admin operations)
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA core_logic TO service_role;

-- 4. Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA core_logic
  GRANT SELECT ON TABLES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA core_logic
  GRANT INSERT, UPDATE, DELETE ON TABLES TO service_role;

-- 5. Expose the schema in PostgREST config
-- This is the critical step: add core_logic to the exposed schemas
ALTER ROLE authenticator SET pgrst.db_schemas = 'public, geo_intel, core_logic';

-- 6. Reload PostgREST config
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
