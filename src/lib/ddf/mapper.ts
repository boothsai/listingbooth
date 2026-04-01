/**
 * DDF Sync Mapper — RESO Property → Supabase res_ddf.properties
 * 
 * Transforms RESO Web API Property resources into the flat schema
 * used by ListingBooth's Supabase database.
 */

import type { ResoProperty } from './reso-client';

export interface ListingRow {
  mls_number: string;
  status: string;
  address: string;
  street_name: string | null;
  street_number: string | null;
  unit_number: string | null;
  city: string;
  province: string;
  postal_code: string | null;
  neighbourhood: string | null;
  latitude: number | null;
  longitude: number | null;
  property_type: string | null;
  building_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  lot_size: number | null;
  year_built: number | null;
  list_price: number;
  sold_price: number | null;
  list_date: string | null;
  sold_date: string | null;
  days_on_market: number | null;
  description: string | null;
  features: string[];
  photos: string[];
  agent_name: string | null;
  office_name: string | null;
  board: string | null;
  raw_ddf: Record<string, unknown>;
  updated_at: string;
}

/**
 * Map RESO StandardStatus → ListingBooth status
 */
function mapStatus(reso: ResoProperty): string {
  const s = (reso.StandardStatus || reso.MlsStatus || '').toLowerCase();
  if (['active', 'active under contract'].includes(s)) return 'active';
  if (['closed', 'sold'].includes(s)) return 'sold';
  if (['pending', 'under contract'].includes(s)) return 'pending';
  if (['cancelled', 'canceled', 'withdrawn', 'expired'].includes(s)) return 'inactive';
  return 'active'; // Default
}

/**
 * Build a full street address string
 */
function buildAddress(reso: ResoProperty): string {
  const parts: string[] = [];
  if (reso.StreetNumber) parts.push(reso.StreetNumber);
  if (reso.StreetName) parts.push(reso.StreetName);
  if (reso.StreetSuffix) parts.push(reso.StreetSuffix);
  if (reso.UnitNumber) parts.push(`Unit ${reso.UnitNumber}`);
  return parts.join(' ') || 'Address unavailable';
}

/**
 * Extract photo URLs from RESO Media resources
 * Returns URLs sorted by Order field
 */
function extractPhotos(reso: ResoProperty): string[] {
  if (!reso.Media || reso.Media.length === 0) return [];

  return reso.Media
    .filter(m => m.MediaCategory === 'Photo' || m.MediaCategory === 'photo')
    .sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0))
    .map(m => m.MediaURL)
    .filter(Boolean);
}

/**
 * Extract searchable feature tags from RESO fields
 */
function extractFeatures(reso: ResoProperty): string[] {
  const features: string[] = [];

  // From standard fields
  if (reso.GarageSpaces && reso.GarageSpaces > 0) features.push('garage');
  if ((reso as any).PoolPrivateYN) features.push('pool');
  if ((reso as any).WaterfrontYN) features.push('waterfront');
  if ((reso as any).FireplaceYN) features.push('fireplace');
  if ((reso as any).CoolingYN) features.push('air_conditioning');
  if ((reso as any).HeatingYN) features.push('heating');

  // From arrays if board provides them
  const extras = (reso as any).InteriorFeatures;
  if (Array.isArray(extras)) {
    for (const f of extras) {
      const lower = String(f).toLowerCase();
      if (lower.includes('hardwood')) features.push('hardwood_floors');
      if (lower.includes('granite')) features.push('granite_counters');
      if (lower.includes('stainless')) features.push('stainless_appliances');
      if (lower.includes('ensuite') || lower.includes('en-suite')) features.push('ensuite');
    }
  }

  return [...new Set(features)]; // Deduplicate
}

/**
 * Determine originating board from RESO data
 */
function detectBoard(reso: ResoProperty): string | null {
  // Try OriginatingSystemName first (CREA DDF standard)
  const sys = (reso as any).OriginatingSystemName;
  if (sys) return sys;

  // Fall back to board detection from city
  const city = (reso.City || '').toLowerCase();
  if (['ottawa', 'kanata', 'barrhaven', 'kemptville', 'smiths falls', 'arnprior', 'carleton place'].some(c => city.includes(c))) {
    return 'OREB';
  }
  if (['toronto', 'mississauga', 'brampton', 'markham', 'vaughan', 'richmond hill', 'oakville', 'pickering'].some(c => city.includes(c))) {
    return 'TRREB';
  }

  return null;
}

/**
 * Main mapper: RESO Property → ListingBooth DB row
 */
export function mapResoToListing(reso: ResoProperty): ListingRow {
  return {
    mls_number: reso.ListingKey || reso.ListingId || '',
    status: mapStatus(reso),
    address: buildAddress(reso),
    street_name: reso.StreetName || null,
    street_number: reso.StreetNumber || null,
    unit_number: reso.UnitNumber || null,
    city: reso.City || 'Unknown',
    province: reso.StateOrProvince || 'ON',
    postal_code: reso.PostalCode || null,
    neighbourhood: reso.SubdivisionName || null,
    latitude: reso.Latitude || null,
    longitude: reso.Longitude || null,
    property_type: reso.PropertyType || null,
    building_type: reso.PropertySubType || null,
    bedrooms: reso.BedroomsTotal ?? null,
    bathrooms: reso.BathroomsTotalInteger ?? null,
    sqft: reso.LivingArea || reso.BuildingAreaTotal || null,
    lot_size: reso.LotSizeArea ?? null,
    year_built: reso.YearBuilt ?? null,
    list_price: reso.ListPrice || 0,
    sold_price: reso.ClosePrice ?? null,
    list_date: reso.ListDate || reso.OnMarketDate || null,
    sold_date: reso.CloseDate || null,
    days_on_market: reso.DaysOnMarket ?? null,
    description: reso.PublicRemarks || null,
    features: extractFeatures(reso),
    photos: extractPhotos(reso),
    agent_name: reso.ListAgentFullName || null,
    office_name: reso.ListOfficeName || null,
    board: detectBoard(reso),
    raw_ddf: reso as unknown as Record<string, unknown>,
    updated_at: reso.ModificationTimestamp || new Date().toISOString(),
  };
}

/**
 * Map a batch of RESO properties
 */
export function mapBatch(properties: ResoProperty[]): ListingRow[] {
  return properties.map(mapResoToListing);
}
