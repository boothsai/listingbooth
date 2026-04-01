-- ============================================================
-- GeoIntelligence Engine — PostGIS RPC Functions (Phase P2.5)
-- Run this in Supabase SQL Editor to enable Spatial Queries
-- ============================================================

-- Function 1: Find boundaries that contain/intersect a coordinate point
-- (Used for: Zoning, Flood Plains, Neighbourhoods, Wards)
CREATE OR REPLACE FUNCTION geo_intel.get_boundaries_intersecting(
  search_lng DOUBLE PRECISION,
  search_lat DOUBLE PRECISION,
  layer_type TEXT
)
RETURNS SETOF geo_intel.boundaries AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM geo_intel.boundaries
  WHERE boundary_type = layer_type
    AND ST_Intersects(
      geom, 
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function 2: Find boundaries within N meters of a coordinate point, sorted by distance
-- (Used for: Schools, Transit stations, Parks, Amenities)
CREATE OR REPLACE FUNCTION geo_intel.get_boundaries_within(
  search_lng DOUBLE PRECISION,
  search_lat DOUBLE PRECISION,
  radius_meters NUMERIC,
  layer_types TEXT[]
)
RETURNS TABLE (
  id UUID,
  boundary_type TEXT,
  city TEXT,
  name TEXT,
  code TEXT,
  attributes JSONB,
  ingested_at TIMESTAMPTZ,
  distance_meters NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.boundary_type,
    b.city,
    b.name,
    b.code,
    b.attributes,
    b.ingested_at,
    -- Calculate precise distance in meters using geography cast
    ST_Distance(
      b.geom::geography, 
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography
    )::NUMERIC AS distance_meters
  FROM geo_intel.boundaries b
  WHERE b.boundary_type = ANY(layer_types)
    AND ST_DWithin(
      b.geom::geography, 
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography, 
      radius_meters
    )
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to anon/authenticated roles to call these functions
GRANT EXECUTE ON FUNCTION geo_intel.get_boundaries_intersecting TO anon, authenticated;
GRANT EXECUTE ON FUNCTION geo_intel.get_boundaries_within TO anon, authenticated;
