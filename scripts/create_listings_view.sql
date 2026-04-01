-- ============================================================
-- Create public.listings view mapping res_ddf.properties
-- to the column names expected by ddf.ts
-- ============================================================

DROP VIEW IF EXISTS public.listings;

CREATE OR REPLACE VIEW public.listings AS
SELECT
  id,
  mls_number AS listing_key,
  mls_number,
  board AS board_id,
  list_price,
  property_type,
  building_type AS property_sub_type,
  status AS listing_status,
  (status = 'Active') AS is_active,
  description AS public_remarks,
  description,
  CONCAT(street_number, ' ', street_name) AS address_street,
  unit_number AS address_unit,
  city AS address_city,
  province AS address_province,
  postal_code AS address_postal_code,
  'CA' AS address_country,
  latitude,
  longitude,
  bedrooms AS bedrooms_total,
  bathrooms AS bathrooms_total,
  sqft AS living_area,
  lot_size AS lot_size_area,
  days_on_market,
  photos AS photo_urls,
  NULL::text AS virtual_tour_url,
  agent_name AS listing_agent_name,
  NULL::text AS listing_agent_id,
  office_name AS listing_brokerage,
  TRUE AS vow_allowed,
  updated_at::text AS modification_timestamp,
  updated_at::text AS updated_at,
  board AS data_source,
  neighbourhood AS community_name,
  neighbourhood,
  NULL::numeric AS ai_score,
  features,
  sold_price,
  sold_date,
  list_date,
  'sale' AS transaction_type,
  year_built,
  street_name,
  street_number
FROM res_ddf.properties;

GRANT SELECT ON public.listings TO anon, authenticated, service_role;

-- Verify
SELECT listing_key, address_street, address_city, latitude, longitude
FROM public.listings
WHERE latitude IS NOT NULL
LIMIT 3;
