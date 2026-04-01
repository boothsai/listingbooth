-- ============================================================
-- GeoIntelligence Engine — PostGIS RPC Functions (Phase P5.1)
-- Dynamic Geographic Cross-Routing (Ottawa vs. Toronto)
-- FIX: Use city column for routing instead of prefixing boundary_type
-- Run this in Supabase SQL Editor
-- ============================================================

-- Function 1: Find boundaries that contain/intersect a coordinate point
-- (Used for: Zoning, Flood Plains, Neighbourhoods, Wards)
CREATE OR REPLACE FUNCTION geo_intel.get_boundaries_intersecting(
  search_lng DOUBLE PRECISION,
  search_lat DOUBLE PRECISION,
  layer_type TEXT
)
RETURNS SETOF geo_intel.boundaries AS $$
DECLARE
  resolved_city TEXT;
BEGIN
  -- Dynamic Geographic Cross-Routing (Phase P5)
  -- Determine the city based on coordinate bounding boxes
  IF search_lat BETWEEN 43.0 AND 44.2 AND search_lng BETWEEN -80.2 AND -78.5 THEN
    resolved_city := 'toronto';
  ELSIF search_lat BETWEEN 44.9 AND 45.6 AND search_lng BETWEEN -76.5 AND -75.0 THEN
    resolved_city := 'ottawa';
  ELSE
    resolved_city := NULL;  -- No city filter, search all
  END IF;

  RETURN QUERY
  SELECT *
  FROM geo_intel.boundaries
  WHERE boundary_type = layer_type
    AND (resolved_city IS NULL OR city = resolved_city)
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
DECLARE
  resolved_city TEXT;
BEGIN
  -- Dynamic Geographic Cross-Routing (Phase P5)
  IF search_lat BETWEEN 43.0 AND 44.2 AND search_lng BETWEEN -80.2 AND -78.5 THEN
    resolved_city := 'toronto';
  ELSIF search_lat BETWEEN 44.9 AND 45.6 AND search_lng BETWEEN -76.5 AND -75.0 THEN
    resolved_city := 'ottawa';
  ELSE
    resolved_city := NULL;
  END IF;

  RETURN QUERY
  SELECT 
    b.id,
    b.boundary_type,
    b.city,
    b.name,
    b.code,
    b.attributes,
    b.ingested_at,
    ST_Distance(
      b.geom::geography, 
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography
    )::NUMERIC AS distance_meters
  FROM geo_intel.boundaries b
  WHERE b.boundary_type = ANY(layer_types)
    AND (resolved_city IS NULL OR b.city = resolved_city)
    AND ST_DWithin(
      b.geom::geography, 
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography, 
      radius_meters
    )
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION geo_intel.get_boundaries_intersecting TO anon, authenticated;
GRANT EXECUTE ON FUNCTION geo_intel.get_boundaries_within TO anon, authenticated;
