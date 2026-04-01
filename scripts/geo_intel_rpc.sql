-- ============================================================
-- GeoIntelligence Engine — PostGIS RPC Functions (Phase P5)
-- Dynamic Geographic Cross-Routing (Ottawa vs. Toronto)
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
DECLARE
  resolved_layer_type TEXT;
BEGIN
  -- Dynamic Geographic Cross-Routing (Phase P5)
  -- If querying generic layers, dynamically resolve to the correct municipal dataset
  IF layer_type IN ('zoning', 'flood', 'school', 'ward', 'neighbourhood') THEN
    -- GTA Bounding Box (Roughly Niagara to Oshawa)
    IF search_lat BETWEEN 43.0 AND 44.2 AND search_lng BETWEEN -80.2 AND -78.5 THEN
      resolved_layer_type := 'toronto_' || layer_type;
    -- NCR Bounding Box (Ottawa)
    ELSIF search_lat BETWEEN 44.9 AND 45.6 AND search_lng BETWEEN -76.5 AND -75.0 THEN
      resolved_layer_type := 'ottawa_' || layer_type;
    ELSE
      -- Fallback or direct explicit layer call
      resolved_layer_type := layer_type; 
    END IF;
  ELSE
    resolved_layer_type := layer_type;
  END IF;

  RETURN QUERY
  SELECT *
  FROM geo_intel.boundaries
  WHERE boundary_type = resolved_layer_type
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
  resolved_layer_types TEXT[];
  city_prefix TEXT;
BEGIN
  -- Dynamic Geographic Cross-Routing (Phase P5)
  IF search_lat BETWEEN 43.0 AND 44.2 AND search_lng BETWEEN -80.2 AND -78.5 THEN
    city_prefix := 'toronto_';
  ELSIF search_lat BETWEEN 44.9 AND 45.6 AND search_lng BETWEEN -76.5 AND -75.0 THEN
    city_prefix := 'ottawa_';
  ELSE
    city_prefix := '';
  END IF;

  SELECT array_agg(
    CASE 
      WHEN l IN ('transit', 'school', 'park', 'amenity') AND city_prefix != '' THEN city_prefix || l
      ELSE l
    END
  ) INTO resolved_layer_types FROM unnest(layer_types) AS l;

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
  WHERE b.boundary_type = ANY(resolved_layer_types)
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
