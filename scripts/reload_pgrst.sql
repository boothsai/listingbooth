-- Force PostgREST to reload its schema cache
-- Run this in the Supabase SQL Editor

-- Method 1: NOTIFY directly
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Method 2: Check what schemas PostgREST sees
SELECT current_setting('pgrst.db_schemas', true) AS exposed_schemas;

-- Method 3: Verify res_ddf exists and has tables
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'res_ddf' 
LIMIT 5;
