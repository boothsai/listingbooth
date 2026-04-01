-- ============================================================
-- DDF Sync Pipeline — Schema Extensions
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

-- 2. Ensure listings table has the right columns for DDF data
-- (These may already exist, ALTER TABLE IF NOT EXISTS handles gracefully)
DO $$
BEGIN
  -- Add board column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'board' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN board TEXT;
  END IF;

  -- Add features array if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'features' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN features TEXT[] DEFAULT '{}';
  END IF;

  -- Add raw_ddf JSONB if missing (for full RESO payload)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'raw_ddf' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN raw_ddf JSONB;
  END IF;

  -- Add lot_size if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'lot_size' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN lot_size NUMERIC;
  END IF;

  -- Add year_built if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'year_built' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN year_built INTEGER;
  END IF;
END $$;

-- 3. Index on mls_number for upsert performance (conflict target)
CREATE UNIQUE INDEX IF NOT EXISTS idx_listings_mls_number 
  ON public.listings(mls_number);

-- 4. Index on city + status for common filtered queries
CREATE INDEX IF NOT EXISTS idx_listings_city_status 
  ON public.listings(city, status);

-- 5. Index on board for board-specific queries
CREATE INDEX IF NOT EXISTS idx_listings_board 
  ON public.listings(board);

-- 6. Index on coordinates for spatial queries
CREATE INDEX IF NOT EXISTS idx_listings_coords 
  ON public.listings(latitude, longitude) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 7. Full-text search index on address + description
CREATE INDEX IF NOT EXISTS idx_listings_search 
  ON public.listings USING gin(
    to_tsvector('english', coalesce(street_name, '') || ' ' || coalesce(city, '') || ' ' || coalesce(description, ''))
  );

-- 8. Index on updated_at for delta sync
CREATE INDEX IF NOT EXISTS idx_listings_updated 
  ON public.listings(updated_at DESC);

-- 9. Grant service role full access to sync_meta
GRANT ALL ON TABLE public.ddf_sync_meta TO service_role;
GRANT SELECT ON TABLE public.ddf_sync_meta TO anon, authenticated;
