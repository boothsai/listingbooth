const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres.qmsbvvnffaojddysvqmd:HAmKH0hFCnbCO109@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

const SQL_STMTS = [
  "CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;",
  "ALTER TABLE res_ddf.listings ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);",
  "UPDATE res_ddf.listings SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location IS NULL;",
  "CREATE INDEX IF NOT EXISTS idx_listings_location ON res_ddf.listings USING GIST (location);",
  `CREATE OR REPLACE FUNCTION res_ddf.sync_location() RETURNS trigger AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    ELSE
        NEW.location := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;`,
  "DROP TRIGGER IF EXISTS trg_sync_location ON res_ddf.listings;",
  `CREATE TRIGGER trg_sync_location
BEFORE INSERT OR UPDATE OF latitude, longitude ON res_ddf.listings
FOR EACH ROW EXECUTE FUNCTION res_ddf.sync_location();`
];

async function main() {
  console.log('Connecting to Supabase session pooler on port 5432...');
  const client = new Client({ 
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    statement_timeout: 10000
  });
  
  try {
    await client.connect();
    console.log('Executing PostGIS migration sequences...');
    for (let i = 0; i < SQL_STMTS.length; i++) {
        console.log(`Running sequence ${i+1}...`);
        await client.query(SQL_STMTS[i]);
    }
    console.log('Success! PostGIS mapping applied.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    console.error('Full Error:', err);
  } finally {
    await client.end();
  }
}

main();
