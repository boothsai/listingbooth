export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    // VOW Compliance mapping (only send real prices if authenticated + VOW accepted)
    let isVowAuthenticated = false;
    if (user && user.email_confirmed_at != null) {
      // Must use service role to check core_logic.user_profiles Since session cookies are restricted
      const adminDb = (await import('@supabase/supabase-js')).createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!
      );
      const { data: profile } = await adminDb.schema('core_logic').from('user_profiles').select('vow_terms_accepted_at').eq('id', user.id).single();
      isVowAuthenticated = !!profile?.vow_terms_accepted_at;
    }

    const { id } = params;
    if (!id) return NextResponse.json({ recommendations: [] });

    // 1. Fetch seed listing
    const { data: seed, error } = await supabase
      .from('ddf_listings')
      .select('list_price, address_city, property_type')
      .eq('listing_key', id)
      .single();

    if (error || !seed) {
      return NextResponse.json({ recommendations: [] });
    }

    // 2. Fetch mathematically similar properties 
    // Logic: Same City, Same Type, +/- 25% List Price, Different ID. Limit 4.
    const priceMin = seed.list_price * 0.75;
    const priceMax = seed.list_price * 1.25;

    const { data: recs } = await supabase
      .from('ddf_listings')
      .select('listing_key, list_price, close_price, address_street, address_city, bedrooms_total, bathrooms_total, property_type, photo_urls, status, is_vow_restricted')
      .eq('status', 'active')
      .eq('address_city', seed.address_city)
      .eq('property_type', seed.property_type)
      .neq('listing_key', id)
      .gte('list_price', priceMin)
      .lte('list_price', priceMax)
      .limit(4);

    if (!recs || recs.length === 0) {
      // Fallback: If no exact matches limit criteria to just city
      const { data: fallback } = await supabase
        .from('ddf_listings')
        .select('listing_key, list_price, close_price, address_street, address_city, bedrooms_total, bathrooms_total, property_type, photo_urls, status, is_vow_restricted')
        .eq('status', 'active')
        .eq('address_city', seed.address_city)
        .neq('listing_key', id)
        .order('list_price', { ascending: false })
        .limit(4);
        
      return NextResponse.json({ recommendations: mapOutput(fallback || [], isVowAuthenticated) });
    }

    return NextResponse.json({ recommendations: mapOutput(recs, isVowAuthenticated) });

  } catch (err: any) {
    console.error('[Recommendation API Error]', err);
    return NextResponse.json({ recommendations: [] });
  }
}

// Ensure payload matches the dashboard's expected typing
function mapOutput(rows: any[], isVowAuthenticated: boolean) {
  return rows.map(l => {
    // VOW Strip
    if (!isVowAuthenticated) {
      l.close_price = null;
    }
    return {
      listing_key: l.listing_key,
      price: l.list_price,
      address: l.address_street ? `${l.address_street}, ${l.address_city}` : l.address_city,
      bedrooms: l.bedrooms_total,
      bathrooms: l.bathrooms_total,
      photo_url: Array.isArray(l.photo_urls) && l.photo_urls.length > 0 ? l.photo_urls[0] : null,
      type: l.property_type,
      vow_locked: !isVowAuthenticated
    };
  });
}
