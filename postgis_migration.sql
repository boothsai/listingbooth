-- 1. Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;

-- 2. Add Geometry Column
ALTER TABLE res_ddf.listings ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);

-- 3. Backfill Existing Data
UPDATE res_ddf.listings 
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location IS NULL;

-- 4. Create Spatial Index
CREATE INDEX IF NOT EXISTS idx_listings_location ON res_ddf.listings USING GIST (location);

-- 5. Create Trigger Function to Auto-Sync
CREATE OR REPLACE FUNCTION res_ddf.sync_location()
RETURNS trigger AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    ELSE
        NEW.location := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Attach Trigger
DROP TRIGGER IF EXISTS trg_sync_location ON res_ddf.listings;
CREATE TRIGGER trg_sync_location
BEFORE INSERT OR UPDATE OF latitude, longitude ON res_ddf.listings
FOR EACH ROW EXECUTE FUNCTION res_ddf.sync_location();
