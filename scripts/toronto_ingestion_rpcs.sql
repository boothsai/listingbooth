-- ============================================================
-- GeoIntelligence Engine — Toronto Ingestion Helper RPCs
-- Run this in Supabase SQL Editor BEFORE running toronto-ingest.mjs
-- ============================================================

-- Single-record insert with ST_GeomFromGeoJSON cast
CREATE OR REPLACE FUNCTION geo_intel.geo_intel_insert_boundary(
  p_boundary_type TEXT,
  p_city TEXT,
  p_name TEXT,
  p_code TEXT,
  p_attributes JSONB,
  p_geojson TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO geo_intel.boundaries (boundary_type, city, name, code, attributes, geom)
  VALUES (
    p_boundary_type,
    p_city,
    p_name,
    p_code,
    p_attributes,
    ST_SetSRID(ST_GeomFromGeoJSON(p_geojson), 4326)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete all records for a given layer type (used before re-ingestion)
CREATE OR REPLACE FUNCTION geo_intel.geo_intel_delete_layer(
  p_layer_type TEXT
)
RETURNS VOID AS $$
BEGIN
  DELETE FROM geo_intel.boundaries
  WHERE boundary_type = p_layer_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to service_role (used by ingestion scripts)
GRANT EXECUTE ON FUNCTION geo_intel.geo_intel_insert_boundary TO service_role;
GRANT EXECUTE ON FUNCTION geo_intel.geo_intel_delete_layer TO service_role;
-- Also grant to anon/authenticated for potential future use
GRANT EXECUTE ON FUNCTION geo_intel.geo_intel_insert_boundary TO anon, authenticated;
GRANT EXECUTE ON FUNCTION geo_intel.geo_intel_delete_layer TO anon, authenticated;
