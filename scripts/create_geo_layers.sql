-- ============================================================
-- GeoIntelligence Engine — Toronto Layer Metadata (Phase P5)
-- Run this in Supabase SQL Editor BEFORE running the ingestion script
-- ============================================================

-- Ensure the geo_intel schema and boundaries table exist
-- (These should already be set up from Phase P2.5 Ottawa ingestion)

-- Rename existing Ottawa layers to use the city-prefixed convention
-- so the dynamic cross-routing in geo_intel_rpc.sql works correctly.
-- IMPORTANT: Only run these UPDATEs once. They are idempotent (WHERE clause prevents double-prefix).
UPDATE geo_intel.boundaries
  SET boundary_type = 'ottawa_' || boundary_type
  WHERE city = 'Ottawa'
    AND boundary_type NOT LIKE 'ottawa_%';

-- Verify the rename worked
-- SELECT DISTINCT boundary_type, city, COUNT(*) FROM geo_intel.boundaries GROUP BY boundary_type, city;

-- Add a spatial index on the geom column if not already present
-- This is critical for ST_Intersects and ST_DWithin performance on 11,000+ Toronto polygons
CREATE INDEX IF NOT EXISTS idx_boundaries_geom_gist
  ON geo_intel.boundaries USING GIST (geom);

-- Add a btree index on boundary_type for the WHERE clause filtering
CREATE INDEX IF NOT EXISTS idx_boundaries_type
  ON geo_intel.boundaries (boundary_type);

-- Add a btree index on city for cross-routing queries
CREATE INDEX IF NOT EXISTS idx_boundaries_city
  ON geo_intel.boundaries (city);
