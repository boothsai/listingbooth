import { createClient } from '@supabase/supabase-js';

// Server-side only — never expose this key to the browser
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

let _base: ReturnType<typeof createClient> | null = null;

function getBase() {
  if (!_base) {
    _base = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });
  }
  return _base;
}

// Target the res_ddf schema on each query
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(): any { return getBase().schema('res_ddf' as never); }

// ── Types ────────────────────────────────────────────────────
// Column names match the actual res_ddf.listings table schema
// (from supabase/migrations/20260317000000_comprehensive_real_estate_schema.sql)

export interface DdfListing {
  id: string;
  listing_key: string;
  mls_number: string | null;
  board_id: string | null;
  list_price: number;
  property_type: string | null;
  property_sub_type: string | null;
  transaction_type: string | null;
  description: string | null;
  public_remarks: string | null;
  address_street: string | null;
  address_unit: string | null;
  address_city: string | null;
  address_province: string | null;
  address_postal_code: string | null;
  address_country: string | null;
  latitude: number | null;
  longitude: number | null;
  bedrooms_total: number | null;
  bathrooms_total: number | null;
  living_area: number | null;
  lot_size_area: number | null;
  listing_status: string | null;    // from the RETS StandardStatus
  is_active: boolean;
  days_on_market: number | null;
  photo_urls: string[] | null;
  virtual_tour_url: string | null;
  listing_agent_name: string | null;
  listing_agent_id: string | null;
  listing_brokerage: string | null;
  vow_allowed: boolean;
  modification_timestamp: string | null;
  updated_at: string;
  data_source: string | null;
  community_name: string | null;
  neighbourhood: string | null;
  ai_score: number | null;
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
  status?: string;  // 'active' | 'sold' — defaults to active (is_active = true)
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

/**
 * Search listings with filters + pagination.
 */
export async function searchListings(params: ListingSearchParams): Promise<ListingSearchResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 12;
  const offset = (page - 1) * limit;
  const activeOnly = params.status !== 'sold';

  let query = db()
    .from('listings')
    .select('*', { count: 'exact' })
    .eq('is_active', activeOnly)
    .range(offset, offset + limit - 1)
    .order('updated_at', { ascending: false });

  if (params.city) query = query.ilike('address_city', `%${params.city}%`);
  if (params.province) query = query.eq('address_province', params.province);
  if (params.min_price) query = query.gte('list_price', params.min_price);
  if (params.max_price) query = query.lte('list_price', params.max_price);
  if (params.beds) query = query.gte('bedrooms_total', params.beds);
  if (params.baths) query = query.gte('bathrooms_total', params.baths);
  if (params.type && params.type !== 'All') query = query.ilike('property_type', `%${params.type}%`);
  if (params.q) {
    query = query.or(
      `address_street.ilike.%${params.q}%,address_city.ilike.%${params.q}%,public_remarks.ilike.%${params.q}%,description.ilike.%${params.q}%`
    );
  }

  const { data, error, count } = await query;
  if (error) throw new Error(`DDF search failed: ${error.message}`);

  const total = count ?? 0;
  return {
    listings: (data as DdfListing[]) ?? [],
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Get a single listing by its key.
 */
export async function getListingById(id: string): Promise<DdfListing | null> {
  const { data, error } = await db()
    .from('listings')
    .select('*')
    .eq('listing_key', id)
    .single();

  if (error) return null;
  return data as DdfListing;
}

/**
 * Get featured listings — AI-scored, most recent active.
 */
export async function getFeaturedListings(limit = 6): Promise<DdfListing[]> {
  const { data, error } = await db()
    .from('listings')
    .select('*')
    .eq('is_active', true)
    .order('list_price', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`DDF featured fetch failed: ${error.message}`);
  return (data as DdfListing[]) ?? [];
}

/**
 * Get market stats aggregated by city.
 */
export async function getMarketStats(city = 'Ottawa'): Promise<MarketStats> {
  const { data, error } = await db()
    .from('listings')
    .select('list_price, days_on_market, updated_at')
    .eq('is_active', true)
    .ilike('address_city', `%${city}%`);

  if (error) throw new Error(`Market stats failed: ${error.message}`);

  const rows = (data as Pick<DdfListing, 'list_price' | 'days_on_market' | 'updated_at'>[]) ?? [];
  const prices = rows.map(r => r.list_price).filter(Boolean).sort((a, b) => a - b);
  const doms = rows.map(r => r.days_on_market).filter((d): d is number => d !== null);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return {
    city,
    median_price: prices.length ? prices[Math.floor(prices.length / 2)] : 0,
    avg_price: prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
    avg_days_on_market: doms.length ? Math.round(doms.reduce((a, b) => a + b, 0) / doms.length) : 0,
    active_count: rows.length,
    new_this_week: rows.filter(r => new Date(r.updated_at) >= oneWeekAgo).length,
  };
}
