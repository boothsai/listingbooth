-- ============================================================
-- GeoIntelligence Engine — P0 Schema Migration
-- Project ATLAS × GeoIntel (Merged Blueprint)
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- Step 0: Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis CASCADE;

-- Step 1: Create geo_intel schema
CREATE SCHEMA IF NOT EXISTS geo_intel;

-- ============================================================
-- Table 1: property_context
-- Core spatial context for each listing (zoning, flood, parcel)
-- ============================================================
CREATE TABLE IF NOT EXISTS geo_intel.property_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  city TEXT NOT NULL, -- 'ottawa' or 'toronto'
  geom GEOMETRY(Point, 4326),
  zoning_code TEXT,
  zoning_description TEXT,
  permitted_uses TEXT[],
  max_height_m NUMERIC,
  in_flood_plain BOOLEAN,
  flood_zone_type TEXT,
  lot_area_sqft NUMERIC,
  lot_frontage_ft NUMERIC,
  assessment_value NUMERIC,
  legal_description TEXT,
  neighbourhood_name TEXT,
  ward_name TEXT,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);
CREATE INDEX IF NOT EXISTS idx_property_geom ON geo_intel.property_context USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_property_listing ON geo_intel.property_context(listing_id);
CREATE INDEX IF NOT EXISTS idx_property_city ON geo_intel.property_context(city);

-- ============================================================
-- Table 2: nearby_amenities
-- Schools, parks, transit stops near a property
-- ============================================================
CREATE TABLE IF NOT EXISTS geo_intel.nearby_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_context_id UUID REFERENCES geo_intel.property_context(id) ON DELETE CASCADE,
  amenity_type TEXT NOT NULL, -- 'school','park','transit_stop','rec_centre'
  name TEXT NOT NULL,
  distance_meters NUMERIC,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  metadata JSONB -- school board, fraser_rank, park size, route numbers, etc.
);
CREATE INDEX IF NOT EXISTS idx_amenities_type ON geo_intel.nearby_amenities(amenity_type);
CREATE INDEX IF NOT EXISTS idx_amenities_ctx ON geo_intel.nearby_amenities(property_context_id);

-- ============================================================
-- Table 3: demographics
-- Census-only demographics (StatsCan 2021)
-- ============================================================
CREATE TABLE IF NOT EXISTS geo_intel.demographics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_context_id UUID REFERENCES geo_intel.property_context(id) ON DELETE CASCADE,
  total_population INTEGER,
  median_age NUMERIC,
  median_household_income NUMERIC,
  avg_household_size NUMERIC,
  owner_occupied_pct NUMERIC,
  population_growth_5yr_pct NUMERIC,
  education_bachelor_plus_pct NUMERIC,
  languages_spoken JSONB,
  raw_census_data JSONB,
  source TEXT DEFAULT 'statscan_2021',
  cached_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_demographics_ctx ON geo_intel.demographics(property_context_id);

-- ============================================================
-- Table 4: developments (GATED)
-- Nearby development applications
-- ============================================================
CREATE TABLE IF NOT EXISTS geo_intel.developments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_context_id UUID REFERENCES geo_intel.property_context(id) ON DELETE CASCADE,
  application_number TEXT,
  application_type TEXT,
  status TEXT,
  description TEXT,
  address TEXT,
  distance_meters NUMERIC,
  submitted_date DATE,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
);
CREATE INDEX IF NOT EXISTS idx_developments_ctx ON geo_intel.developments(property_context_id);

-- ============================================================
-- Table 5: building_permits (GATED)
-- Nearby active building permits
-- ============================================================
CREATE TABLE IF NOT EXISTS geo_intel.building_permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_context_id UUID REFERENCES geo_intel.property_context(id) ON DELETE CASCADE,
  permit_number TEXT,
  permit_type TEXT,
  work_description TEXT,
  estimated_value NUMERIC,
  status TEXT,
  issued_date DATE,
  address TEXT,
  distance_meters NUMERIC
);
CREATE INDEX IF NOT EXISTS idx_permits_ctx ON geo_intel.building_permits(property_context_id);

-- ============================================================
-- Table 6: crime_stats (GATED)
-- Crime statistics for the area
-- ============================================================
CREATE TABLE IF NOT EXISTS geo_intel.crime_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_context_id UUID REFERENCES geo_intel.property_context(id) ON DELETE CASCADE,
  offence_category TEXT,
  offence_type TEXT,
  occurrence_count INTEGER,
  time_period TEXT,
  area_name TEXT,
  raw_data JSONB,
  cached_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crime_ctx ON geo_intel.crime_stats(property_context_id);

-- ============================================================
-- Table 7: boundaries
-- Cached spatial boundaries (zoning polygons, school catchments, flood zones, wards)
-- ============================================================
CREATE TABLE IF NOT EXISTS geo_intel.boundaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boundary_type TEXT NOT NULL, -- 'zoning','school_catchment','flood_plain','neighbourhood','ward'
  city TEXT NOT NULL,
  name TEXT,
  code TEXT,
  geom GEOMETRY(MultiPolygon, 4326),
  attributes JSONB,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_boundaries_geom ON geo_intel.boundaries USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_boundaries_type ON geo_intel.boundaries(boundary_type, city);

-- ============================================================
-- Table 8: school_rankings
-- Fraser Institute school rankings (static cache)
-- ============================================================
CREATE TABLE IF NOT EXISTS geo_intel.school_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL,
  school_board TEXT,
  city TEXT,
  fraser_rank NUMERIC,
  fraser_rating NUMERIC,
  school_type TEXT, -- 'elementary','secondary'
  grades TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_school_rankings_city ON geo_intel.school_rankings(city);

-- ============================================================
-- Verification: confirm all tables exist
-- ============================================================
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema = 'geo_intel'
ORDER BY table_name;
