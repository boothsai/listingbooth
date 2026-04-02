import { createClient } from '@supabase/supabase-js';

let _base: ReturnType<typeof createClient> | null = null;

function getBase() {
  if (!_base) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;
    _base = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });
  }
  return _base;
}

// Uses public.listings view → res_ddf.properties
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(): any { return getBase(); }

// ── Types ────────────────────────────────────────────────────
// Column names match res_ddf.properties (exposed via public.listings view)

export interface DdfListing {
  id: string;
  mls_number: string | null;
  status: string | null;
  address: string | null;
  street_name: string | null;
  street_number: string | null;
  unit_number: string | null;
  city: string | null;
  province: string | null;
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
  features: string[] | null;
  photos: string[] | null;
  agent_name: string | null;
  office_name: string | null;
  board: string | null;
  raw_ddf: any | null;
  updated_at: string;
  created_at: string;

  // Computed aliases for backward compatibility with templates
  listing_key: string;
  address_street: string | null;
  address_city: string | null;
  address_province: string | null;
  address_postal_code: string | null;
  photo_urls: string[] | null;
  listing_agent_name: string | null;
  listing_brokerage: string | null;
  listing_status: string | null;
  bedrooms_total: number | null;
  bathrooms_total: number | null;
  living_area: number | null;
  public_remarks: string | null;
  is_active: boolean;
}

// Map raw DB row to DdfListing with backward-compatible aliases
function mapListing(row: any): DdfListing {
  return {
    ...row,
    listing_key: row.mls_number || row.id,
    address_street: row.street_number && row.street_name
      ? `${row.street_number} ${row.street_name}`
      : row.street_name || row.address || '',
    address_city: row.city,
    address_province: row.province,
    address_postal_code: row.postal_code,
    photo_urls: row.photos,
    listing_agent_name: row.agent_name,
    listing_brokerage: row.office_name,
    listing_status: row.status,
    bedrooms_total: row.bedrooms,
    bathrooms_total: row.bathrooms,
    living_area: row.sqft,
    public_remarks: row.description,
    is_active: row.status === 'active',
  };
}

export interface ListingSearchParams {
  q?: string;
  city?: string;
  province?: string;
  min_price?: number;
  max_price?: number;
  beds?: number;
  baths?: number;
  type?: string;
  status?: string;
  features?: string[];
  page?: number;
  limit?: number;
}

export interface ListingSearchResult {
  listings: DdfListing[];
  total: number;
  page: number;
  pages: number;
}

export interface MarketStats {
  city: string;
  median_price: number;
  avg_price: number;
  avg_days_on_market: number;
  active_count: number;
  new_this_week: number;
}

// ── Queries ──────────────────────────────────────────────────

export async function searchListings(params: ListingSearchParams): Promise<ListingSearchResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 12;
  const offset = (page - 1) * limit;
  const showActive = params.status !== 'sold';

  let query = db()
    .from('ddf_listings')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('updated_at', { ascending: false });

  // Filter by status
  if (showActive) query = query.eq('status', 'active');

  if (params.city) query = query.ilike('city', `%${params.city}%`);
  if (params.province) query = query.eq('province', params.province);
  if (params.min_price) query = query.gte('list_price', params.min_price);
  if (params.max_price) query = query.lte('list_price', params.max_price);
  if (params.beds) query = query.gte('bedrooms', params.beds);
  if (params.baths) query = query.gte('bathrooms', params.baths);
  if (params.type && params.type !== 'All') query = query.ilike('property_type', `%${params.type}%`);
  if (params.q) {
    query = query.or(
      `street_name.ilike.%${params.q}%,city.ilike.%${params.q}%,description.ilike.%${params.q}%`
    );
  }
  if (params.features && params.features.length > 0) {
    query = query.contains('features', params.features);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(`DDF search failed: ${error.message}`);

  const total = count ?? 0;
  return {
    listings: ((data as any[]) ?? []).map(mapListing),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

export async function getListingById(id: string): Promise<DdfListing | null> {
  // Try mls_number first, then id
  let { data, error } = await db()
    .from('ddf_listings')
    .select('*')
    .eq('mls_number', id)
    .single();

  if (error || !data) {
    ({ data, error } = await db()
      .from('ddf_listings')
      .select('*')
      .eq('id', id)
      .single());
  }

  if (error || !data) return null;
  return mapListing(data);
}

export async function getFeaturedListings(limit = 6): Promise<DdfListing[]> {
  const { data, error } = await db()
    .from('ddf_listings')
    .select('*')
    .eq('status', 'active')
    .order('list_price', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`DDF featured fetch failed: ${error.message}`);
  return ((data as any[]) ?? []).map(mapListing);
}

export async function getMarketStats(city = 'Ottawa'): Promise<MarketStats> {
  const { data, error } = await db()
    .from('ddf_listings')
    .select('list_price, days_on_market, updated_at')
    .eq('status', 'active')
    .ilike('city', `%${city}%`);

  if (error) throw new Error(`Market stats failed: ${error.message}`);

  const rows = (data as any[]) ?? [];
  const prices = rows.map(r => r.list_price).filter(Boolean).sort((a: number, b: number) => a - b);
  const doms = rows.map(r => r.days_on_market).filter((d): d is number => d !== null);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return {
    city,
    median_price: prices.length ? prices[Math.floor(prices.length / 2)] : 0,
    avg_price: prices.length ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length) : 0,
    avg_days_on_market: doms.length ? Math.round(doms.reduce((a: number, b: number) => a + b, 0) / doms.length) : 0,
    active_count: rows.length,
    new_this_week: rows.filter(r => new Date(r.updated_at) >= oneWeekAgo).length,
  };
}
