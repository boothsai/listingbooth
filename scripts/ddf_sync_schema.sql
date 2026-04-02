-- ============================================================
-- DDF Sync Pipeline — Schema Extensions
-- Indexes on res_ddf.properties (the real table behind public.listings view)
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Sync metadata table — tracks last sync per feed
CREATE TABLE IF NOT EXISTS public.ddf_sync_meta (
  feed_name TEXT PRIMARY KEY,
  last_sync_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_synced INTEGER DEFAULT 0,
  last_error TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Ensure res_ddf.properties has the right columns for DDF data
DO $$
BEGIN
  -- Add board column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'board' AND table_schema = 'res_ddf'
  ) THEN
    ALTER TABLE res_ddf.properties ADD COLUMN board TEXT;
  END IF;

  -- Add features array if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'features' AND table_schema = 'res_ddf'
  ) THEN
    ALTER TABLE res_ddf.properties ADD COLUMN features TEXT[] DEFAULT '{}';
  END IF;

  -- Add raw_ddf JSONB if missing (for full RESO payload)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'raw_ddf' AND table_schema = 'res_ddf'
  ) THEN
    ALTER TABLE res_ddf.properties ADD COLUMN raw_ddf JSONB;
  END IF;

  -- Add lot_size if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'lot_size' AND table_schema = 'res_ddf'
  ) THEN
    ALTER TABLE res_ddf.properties ADD COLUMN lot_size NUMERIC;
  END IF;

  -- Add year_built if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'year_built' AND table_schema = 'res_ddf'
  ) THEN
    ALTER TABLE res_ddf.properties ADD COLUMN year_built INTEGER;
  END IF;
END $$;

-- 3. Index on mls_number for upsert performance (conflict target)
CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_mls_number 
  ON res_ddf.properties(mls_number);

-- 4. Index on city + status for common filtered queries
CREATE INDEX IF NOT EXISTS idx_properties_city_status 
  ON res_ddf.properties(city, status);

-- 5. Index on board for board-specific queries
CREATE INDEX IF NOT EXISTS idx_properties_board 
  ON res_ddf.properties(board);

-- 6. Index on coordinates for spatial queries
CREATE INDEX IF NOT EXISTS idx_properties_coords 
  ON res_ddf.properties(latitude, longitude) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 7. Index on updated_at for delta sync ordering
CREATE INDEX IF NOT EXISTS idx_properties_updated 
  ON res_ddf.properties(updated_at DESC);

-- 8. Grant service role full access to sync_meta
GRANT ALL ON TABLE public.ddf_sync_meta TO service_role;
GRANT SELECT ON TABLE public.ddf_sync_meta TO anon, authenticated;
