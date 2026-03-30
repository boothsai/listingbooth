// Server-side API route for spatial listing queries
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * POST /api/listings/bounds
 * 
 * Secure API Gateway for the Interactive Map Search.
 * Accepts an array of North/South/East/West bounds and dynamically queries the DDF database
 * to return property points within that exact viewport.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { minLat, maxLat, minLng, maxLng, cityFilter, minPrice, maxPrice, beds, baths, propertyType, sort } = body;

    if (!minLat || !maxLat || !minLng || !maxLng) {
      return NextResponse.json({ error: 'Missing bounding coordinates' }, { status: 400 });
    }

    let isVowAuthenticated = false;
    try {
      const cookieStore = await cookies();
      const supabaseSession = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
      );
      const { data: authData } = await supabaseSession.auth.getUser();
      isVowAuthenticated = !!authData?.user;
    } catch {}

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!,
      { db: { schema: 'res_ddf' } }
    );

    let query = supabase
      .from('listings')
      .select('listing_key, latitude, longitude, list_price, close_price, property_type, bedrooms_total, bathrooms_total, photo_urls, address_street, address_city, listing_status, listing_contract_date, living_area, days_on_market')
      .gte('latitude', minLat)
      .lte('latitude', maxLat)
      .gte('longitude', minLng)
      .lte('longitude', maxLng)
      .eq('is_active', true);

    if (cityFilter && cityFilter !== 'All') {
      query = query.ilike('address_city', `%${cityFilter}%`);
    }

    // Apply filter params
    if (minPrice) query = query.gte('list_price', minPrice);
    if (maxPrice) query = query.lte('list_price', maxPrice);
    if (beds && beds !== 'Any') query = query.gte('bedrooms_total', parseInt(beds));
    if (baths && baths !== 'Any') query = query.gte('bathrooms_total', parseInt(baths));
    if (propertyType && propertyType !== 'All') query = query.ilike('property_type', `%${propertyType}%`);

    // Sort
    if (sort === 'price_asc') query = query.order('list_price', { ascending: true });
    else if (sort === 'price_desc') query = query.order('list_price', { ascending: false });
    else query = query.order('listing_contract_date', { ascending: false });

    query = query.limit(500);

    const { data: listings, error } = await query;

    if (error) {
      console.error('Map Search API Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Compute aggregate stats
    const prices = (listings || []).map((l: any) => l.list_price).filter(Boolean);
    const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length) : 0;

    const sanitizedListings = (listings || []).map((l: any) => {
      if (l.listing_status === 'Sold' && !l.sold_price) {
         l.sold_price = l.list_price;
      }
      if (!isVowAuthenticated) {
        l.sold_price = null;
        l._vow_locked = true;
      }
      return l;
    });

    return NextResponse.json({ 
      count: sanitizedListings.length, 
      results: sanitizedListings,
      stats: { avgPrice, count: sanitizedListings.length }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
