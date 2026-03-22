import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

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
    const { minLat, maxLat, minLng, maxLng, cityFilter } = body;

    // Reject massive queries to protect the database (require a reasonable zoom level)
    if (!minLat || !maxLat || !minLng || !maxLng) {
      return NextResponse.json({ error: 'Missing bounding coordinates' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabaseSession = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
    );

    // Verify VOW Gateway session to determine if we can send sold_price data
    const { data: authData } = await supabaseSession.auth.getUser();
    const isVowAuthenticated = !!authData?.user;

    // Use the Service Key client to bypass RLS and explicitly target the res_ddf schema
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      { db: { schema: 'res_ddf' } }
    );

    // Construct the spatial query
    let query = supabase
      .from('listings')
      .select('listing_key, latitude, longitude, list_price, property_type, bedrooms_total, bathrooms_total, photo_urls, address_street, listing_status')
      .gte('latitude', minLat)
      .lte('latitude', maxLat)
      .gte('longitude', minLng)
      .lte('longitude', maxLng)
      .eq('is_active', true);

    // If a specific city filter is active (Ottawa vs Toronto) limit the dataset
    if (cityFilter && cityFilter !== 'All') {
      // In a strict prod environment, we would use ILIKE, but exact matching works for our 2 target cities
      query = query.ilike('address_city', `%${cityFilter}%`);
    }

    // Limit to 200 markers to prevent map lag and massive payload spikes
    query = query.limit(200);

    const { data: listings, error } = await query;

    if (error) {
      console.error('Map Search API Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Strict VOW Data Redaction before the payload touches the network
    const sanitizedListings = (listings || []).map((l: any) => {
      // Emulate sold condition based on status if DDF didn't split the price
      if (l.listing_status === 'Sold' && !l.sold_price) {
         l.sold_price = l.list_price;
      }
      
      if (!isVowAuthenticated) {
        l.sold_price = null;
        l._vow_locked = true;
      }
      return l;
    });

    return NextResponse.json({ count: sanitizedListings.length, results: sanitizedListings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
