/**
 * GeoIntelligence Engine — Supabase Data Access Layer
 * 
 * Provides spatial queries against the geo_intel schema:
 *   - Point-in-polygon lookups (zoning, flood, neighbourhood, ward)
 *   - Nearby amenity search (schools, parks, transit)
 *   - Demographics lookup by neighbourhood
 *   - Full context assembly for a listing
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qmsbvvnffaojddysvqmd.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

// Separate client for geo_intel schema
const geoDb = createClient(SUPABASE_URL, SERVICE_KEY, {
  db: { schema: 'geo_intel' },
});

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface ZoningResult {
  zone_code: string;
  zone_description: string;
  permitted_uses: string[];
  max_height: string | null;
  heritage_overlay: boolean;
  nearby_dev_apps: number;
  source: string;
}

export interface FloodRiskResult {
  in_flood_plain: boolean;
  flood_zone_type: string | null;
  risk_level: 'none' | 'low' | 'moderate' | 'high';
  source: string;
}

export interface SchoolResult {
  name: string;
  board: string;
  category: string;
  grades: string;
  distance_km: number;
  lat: number;
  lng: number;
  fraser_rank?: number;
}

export interface DemographicResult {
  neighbourhood: string;
  ward: string;
  population: number | null;
  median_age: number | null;
  median_income: number | null;
  owner_pct: number | null;
  source: string;
}

export interface NearbyAmenity {
  type: string;
  name: string;
  category: string;
  distance_km: number;
  lat: number;
  lng: number;
  details: Record<string, unknown>;
}

export interface TransitResult {
  name: string;
  type: 'brt' | 'otrain' | 'lrt' | 'lrt_stage2';
  distance_km: number;
  lat: number;
  lng: number;
}

export interface DevAppResult {
  app_number: string;
  app_type: string;
  status: string;
  description: string;
  address: string;
  submitted_date: string | null;
  distance_km: number;
  lat: number;
  lng: number;
}

export interface CrimeResult {
  offence: string;
  offence_detail: string;
  occurrence_date: string | null;
  community: string;
  road_name: string;
  distance_km: number;
  lat: number;
  lng: number;
}

export interface PermitResult {
  description: string;
  status: string;
  project_type: string;
  start_date: string | null;
  end_date: string | null;
  ward: string;
  road_name: string;
  distance_km: number;
  lat: number;
  lng: number;
}

export interface SpatialContext {
  zoning: ZoningResult | null;
  flood_risk: FloodRiskResult | null;
  schools: SchoolResult[];
  demographics: DemographicResult | null;
  transit: TransitResult[];
  amenities: NearbyAmenity[];
  neighbourhood: string | null;
  ward: string | null;
}

// ────────────────────────────────────────────────────────────
// Helper: Haversine distance (km)
// ────────────────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ────────────────────────────────────────────────────────────
// Zoning Lookup
// ────────────────────────────────────────────────────────────

export async function getZoning(lat: number, lng: number): Promise<ZoningResult | null> {
  const { data: zones } = await geoDb.rpc('get_boundaries_intersecting', {
    search_lng: lng,
    search_lat: lat,
    layer_type: 'zoning'
  });

  if (!zones || zones.length === 0) return null;

  const zone = zones[0]; 

  return {
    zone_code: zone.code || 'Unknown',
    zone_description: zone.name || '',
    permitted_uses: parsePermittedUses(zone.code || ''),
    max_height: zone.attributes?.HEIGHT ? `${zone.attributes.HEIGHT}m` : null,
    heritage_overlay: !!zone.attributes?.HIST || !!zone.attributes?.HISTATUS,
    nearby_dev_apps: 0,
    source: 'City of Ottawa Open Data (open.ottawa.ca)',
  };
}

// ────────────────────────────────────────────────────────────
// Flood Risk Lookup
// ────────────────────────────────────────────────────────────

export async function getFloodRisk(lat: number, lng: number): Promise<FloodRiskResult> {
  const { data: floods } = await geoDb.rpc('get_boundaries_intersecting', {
    search_lng: lng,
    search_lat: lat,
    layer_type: 'flood_plain'
  });

  const inFloodPlain = floods && floods.length > 0;

  return {
    in_flood_plain: inFloodPlain,
    flood_zone_type: inFloodPlain ? (floods[0].name || 'Regulatory Flood Plain') : null,
    risk_level: inFloodPlain ? 'high' : 'none',
    source: 'City of Ottawa Open Data — Flood Plain Overlay (Section 58)',
  };
}

// ────────────────────────────────────────────────────────────
// Schools Nearby
// ────────────────────────────────────────────────────────────

export async function getNearbySchools(lat: number, lng: number, radiusKm = 3): Promise<SchoolResult[]> {
  const { data: schools } = await geoDb.rpc('get_boundaries_within', {
    search_lng: lng,
    search_lat: lat,
    radius_meters: radiusKm * 1000,
    layer_types: ['school']
  });

  if (!schools || schools.length === 0) return [];

  return schools.map((s: any) => ({
    name: s.name || '',
    board: s.attributes?.school_board || s.attributes?.BOARD_EN || '',
    category: s.attributes?.category || s.attributes?.CATEGORY_EN || '',
    grades: s.attributes?.grades || s.attributes?.GRADE_RANGE || '',
    distance_km: s.distance_meters / 1000,
    lat: s.attributes?.lat || lat,
    lng: s.attributes?.lng || lng,
    fraser_rank: undefined,
  })).slice(0, 15);
}

// ────────────────────────────────────────────────────────────
// Demographics (Neighbourhood lookup)
// ────────────────────────────────────────────────────────────

export async function getDemographics(lat: number, lng: number): Promise<DemographicResult | null> {
  // Get intersecting neighbourhood and ward via PostGIS
  const { data: hoods } = await geoDb.rpc('get_boundaries_intersecting', { search_lng: lng, search_lat: lat, layer_type: 'neighbourhood' });
  const { data: wards } = await geoDb.rpc('get_boundaries_intersecting', { search_lng: lng, search_lat: lat, layer_type: 'ward' });

  const hood = hoods && hoods.length > 0 ? hoods[0] : null;
  const ward = wards && wards.length > 0 ? wards[0] : null;

  return {
    neighbourhood: hood?.name || 'Ottawa',
    ward: ward?.name || '',
    population: null,
    median_age: null,
    median_income: null,
    owner_pct: null,
    source: 'Statistics Canada, 2021 Census of Population',
  };
}

// ────────────────────────────────────────────────────────────
// Nearby Transit (BRT, O-Train, LRT)
// ────────────────────────────────────────────────────────────

export async function getNearbyTransit(lat: number, lng: number, radiusKm = 3): Promise<TransitResult[]> {
  const transitLayers = ['transit_station', 'otrain_station', 'lrt_station', 'lrt_stage2'];
  
  const { data: stations } = await geoDb.rpc('get_boundaries_within', {
    search_lng: lng,
    search_lat: lat,
    radius_meters: radiusKm * 1000,
    layer_types: transitLayers
  });

  if (!stations || stations.length === 0) return [];

  return stations.map((s: any) => ({
    name: s.name || 'Unknown Station',
    type: s.boundary_type.replace('_station', '').replace('transit', 'brt') as 'brt'|'otrain'|'lrt'|'lrt_stage2',
    distance_km: s.distance_meters / 1000,
    lat: s.attributes?.lat || lat,
    lng: s.attributes?.lng || lng,
  })).slice(0, 20);
}

// ────────────────────────────────────────────────────────────
// Nearby Amenities (Parks, Rec, Playgrounds, etc.)
// ────────────────────────────────────────────────────────────

const AMENITY_TYPES = [
  { boundary: 'park',             category: 'Parks',       icon: '🌳' },
  { boundary: 'rec_facility',     category: 'Recreation',  icon: '🏋️' },
  { boundary: 'rec_centre',       category: 'Recreation',  icon: '🏢' },
  { boundary: 'playground',       category: 'Family',      icon: '🛝' },
  { boundary: 'splash_pad',       category: 'Family',      icon: '💦' },
  { boundary: 'outdoor_pool',     category: 'Family',      icon: '🏊' },
  { boundary: 'beach',            category: 'Nature',      icon: '🏖️' },
  { boundary: 'dog_park',         category: 'Pets',        icon: '🐕' },
  { boundary: 'tennis_court',     category: 'Sports',      icon: '🎾' },
  { boundary: 'basketball_court', category: 'Sports',      icon: '🏀' },
  { boundary: 'outdoor_rink',     category: 'Sports',      icon: '⛸️' },
  { boundary: 'skatepark',        category: 'Sports',      icon: '🛹' },
  { boundary: 'pickleball_court', category: 'Sports',      icon: '🏸' },
  { boundary: 'community_garden', category: 'Community',   icon: '🌱' },
];

export async function getNearbyAmenities(lat: number, lng: number, radiusKm = 2): Promise<NearbyAmenity[]> {
  const AMENITY_LAYERS = [
    'park', 'rec_facility', 'rec_centre', 'playground', 'splash_pad', 
    'outdoor_pool', 'beach', 'dog_park', 'tennis_court', 'basketball_court', 
    'outdoor_rink', 'skatepark', 'pickleball_court', 'community_garden'
  ];

  const { data: items } = await geoDb.rpc('get_boundaries_within', {
    search_lng: lng,
    search_lat: lat,
    radius_meters: radiusKm * 1000,
    layer_types: AMENITY_LAYERS
  });

  if (!items || items.length === 0) return [];

  const typeConfig: Record<string, { cat: string, icon: string }> = {
    'park': { cat: 'Parks', icon: '🌳' },
    'rec_facility': { cat: 'Recreation', icon: '🏋️' },
    'rec_centre': { cat: 'Recreation', icon: '🏢' },
    'playground': { cat: 'Family', icon: '🛝' },
    'splash_pad': { cat: 'Family', icon: '💦' },
    'outdoor_pool': { cat: 'Family', icon: '🏊' },
    'beach': { cat: 'Nature', icon: '🏖️' },
    'dog_park': { cat: 'Pets', icon: '🐕' },
    'tennis_court': { cat: 'Sports', icon: '🎾' },
    'basketball_court': { cat: 'Sports', icon: '🏀' },
    'outdoor_rink': { cat: 'Sports', icon: '⛸️' },
    'skatepark': { cat: 'Sports', icon: '🛹' },
    'pickleball_court': { cat: 'Sports', icon: '🏸' },
    'community_garden': { cat: 'Community', icon: '🌱' }
  };

  return items.map((item: any) => {
    const config = typeConfig[item.boundary_type] || { cat: 'Other', icon: '📍' };
    return {
      type: item.boundary_type,
      name: item.name || 'Unknown',
      category: config.cat,
      distance_km: item.distance_meters / 1000,
      lat: item.attributes?.lat || lat,
      lng: item.attributes?.lng || lng,
      details: { icon: config.icon }
    };
  }).slice(0, 30);
}

// ────────────────────────────────────────────────────────────
// GATED: Nearby Development Applications
// ────────────────────────────────────────────────────────────

export async function getNearbyDevApps(lat: number, lng: number, radiusKm = 1.5): Promise<DevAppResult[]> {
  const { data: apps } = await geoDb.rpc('get_boundaries_within', {
    search_lng: lng,
    search_lat: lat,
    radius_meters: radiusKm * 1000,
    layer_types: ['dev_app']
  });

  if (!apps || apps.length === 0) return [];

  return apps.map((a: any) => ({
    app_number: a.name || 'Unknown',
    app_type: a.attributes?.app_type || 'Development',
    status: a.attributes?.status || 'Active',
    description: a.attributes?.description || '',
    address: a.attributes?.address || '',
    submitted_date: a.attributes?.submitted_date || null,
    distance_km: a.distance_meters / 1000,
    lat: a.attributes?.lat || lat,
    lng: a.attributes?.lng || lng,
  })).slice(0, 20);
}

// ────────────────────────────────────────────────────────────
// GATED: Nearby Crime Occurrences
// ────────────────────────────────────────────────────────────

export async function getNearbyCrimes(lat: number, lng: number, radiusKm = 1.5): Promise<CrimeResult[]> {
  const { data: crimes } = await geoDb.rpc('get_boundaries_within', {
    search_lng: lng,
    search_lat: lat,
    radius_meters: radiusKm * 1000,
    layer_types: ['crime']
  });

  if (!crimes || crimes.length === 0) return [];

  return crimes.map((c: any) => ({
    offence: c.name || 'Unknown',
    offence_detail: c.attributes?.offence_ext || c.attributes?.offence_desc || '',
    occurrence_date: c.attributes?.occurrence_date || c.attributes?.report_date || null,
    community: c.attributes?.community || '',
    road_name: c.attributes?.road_name || '',
    distance_km: c.distance_meters / 1000,
    lat: c.attributes?.lat || lat,
    lng: c.attributes?.lng || lng,
  })).slice(0, 30);
}

// ────────────────────────────────────────────────────────────
// GATED: Nearby Building Permits / Construction
// ────────────────────────────────────────────────────────────

export async function getNearbyPermits(lat: number, lng: number, radiusKm = 2): Promise<PermitResult[]> {
  const { data: permits } = await geoDb.rpc('get_boundaries_within', {
    search_lng: lng,
    search_lat: lat,
    radius_meters: radiusKm * 1000,
    layer_types: ['building_permit']
  });

  if (!permits || permits.length === 0) return [];

  return permits.map((p: any) => ({
    description: p.name || 'Construction Activity',
    status: p.attributes?.status || 'Active',
    project_type: p.attributes?.project_type || '',
    start_date: p.attributes?.start_date || null,
    end_date: p.attributes?.end_date || null,
    ward: p.attributes?.ward || '',
    road_name: p.attributes?.road_name || '',
    distance_km: p.distance_meters / 1000,
    lat: p.attributes?.lat || lat,
    lng: p.attributes?.lng || lng,
  })).slice(0, 20);
}

export async function getFullSpatialContext(lat: number, lng: number): Promise<SpatialContext> {
  const [zoning, flood_risk, schools, demographics, transit, amenities] = await Promise.all([
    getZoning(lat, lng),
    getFloodRisk(lat, lng),
    getNearbySchools(lat, lng),
    getDemographics(lat, lng),
    getNearbyTransit(lat, lng),
    getNearbyAmenities(lat, lng),
  ]);

  return {
    zoning,
    flood_risk,
    schools,
    demographics,
    transit,
    amenities,
    neighbourhood: demographics?.neighbourhood || null,
    ward: demographics?.ward || null,
  };
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function detectCity(lat: number, lng: number): string {
  // Ottawa bounding box: roughly lat 45.1-45.6, lng -76.4 to -75.2
  // Toronto bounding box: roughly lat 43.5-43.9, lng -79.7 to -79.1
  if (lat >= 44.8 && lat <= 45.8 && lng >= -76.5 && lng <= -75.0) return 'ottawa';
  if (lat >= 43.3 && lat <= 44.0 && lng >= -80.0 && lng <= -79.0) return 'toronto';
  // Default to Ottawa for now
  return 'ottawa';
}

function parsePermittedUses(zoneCode: string): string[] {
  const prefix = zoneCode.replace(/[^A-Z]/g, '').substring(0, 2);
  const ZONE_MAP: Record<string, string[]> = {
    'R1': ['Detached dwelling', 'Home-based business', 'Secondary dwelling unit'],
    'R2': ['Detached dwelling', 'Semi-detached dwelling', 'Duplex', 'Home-based business'],
    'R3': ['Detached', 'Semi-detached', 'Duplex', 'Triplex', 'Townhouse'],
    'R4': ['Detached', 'Semi-detached', 'Townhouse', 'Stacked townhouse', 'Low-rise apartment'],
    'R5': ['Apartment building (mid-rise)', 'Townhouse', 'Mixed use'],
    'RM': ['Multiple dwellings', 'Apartment', 'Townhouse'],
    'GM': ['General mixed use', 'Residential', 'Commercial', 'Office'],
    'AM': ['Arterial mainstreet', 'Mixed use', 'Residential above commercial'],
    'TM': ['Traditional mainstreet', 'Mixed use', 'Retail', 'Residential'],
    'MC': ['Mixed use centre', 'High-density residential', 'Commercial', 'Office'],
    'MD': ['Mixed-use downtown', 'Office', 'Residential', 'Retail', 'Hotel'],
    'LC': ['Local commercial', 'Retail', 'Restaurant', 'Office'],
    'IL': ['Light industrial', 'Warehouse', 'Office', 'Manufacturing'],
    'IH': ['Heavy industrial', 'Manufacturing', 'Waste processing'],
    'IG': ['General industrial', 'Manufacturing', 'Warehousing', 'Office'],
    'O1': ['Open space', 'Parks', 'Recreation', 'Conservation'],
    'EP': ['Environmental protection', 'Conservation', 'Passive recreation'],
    'DR': ['Development reserve'],
    'RU': ['Rural residential', 'Agriculture', 'Home-based business'],
    'AG': ['Agricultural', 'Farming', 'Farm-related commercial'],
    'RC': ['Rural commercial'],
    'RI': ['Rural institutional'],
    'VM': ['Village mixed use'],
    'V1': ['Village residential first density'],
    'V2': ['Village residential second density'],
    'V3': ['Village residential third density'],
    'I1': ['Institutional', 'School', 'Church', 'Community centre'],
    'I2': ['Major institutional', 'Hospital', 'University', 'Government'],
  };
  return ZONE_MAP[prefix] || ['See municipal zoning by-law for details'];
}
