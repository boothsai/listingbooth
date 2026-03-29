export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!,
    { cookies: { getAll() { return []; }, setAll() {} } }
  );
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const city = req.nextUrl.searchParams.get('city');
    const status = req.nextUrl.searchParams.get('status');
    const slug = req.nextUrl.searchParams.get('slug');

    let query: any = supabase
      .schema('core_logic')
      .from('builder_communities')
      .select('*, builders(name), builder_products(price_from)')
      .order('created_at', { ascending: false });

    if (city) query = query.eq('city', city);
    if (status) query = query.eq('status', status);
    
    // Convert D2B schema to the existing Project frontend interface
    const formatProject = (c: any) => {
      // Find minimum price among all products in this community
      const prices = (c.builder_products || []).map((p: any) => p.price_from).filter(Boolean);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

      return {
        slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: c.name,
        builder: c.builders?.name || 'Unknown Builder',
        city: c.city,
        price_from: minPrice,
        property_type: 'Master-Planned Community',
        status: c.status || 'Pre-Construction',
        color: '#111',
        description: `Premium new construction community by ${c.builders?.name || 'Unknown Builder'} located in ${c.city}.`,
        total_units: prices.length || 0, // Fallback unit count approximation based on extracted product models
        completion_year: 2026,
        photo_url: c.hero_image_url
      };
    };

    if (slug) {
      // Find matching slug conceptually since we generate it dynamically above
      const { data, error } = await query;
      if (error) return NextResponse.json({ project: null, error: error.message }, { status: 404 });
      
      const matched = data.find((c: any) => formatProject(c).slug === slug);
      if (!matched) return NextResponse.json({ project: null, error: 'Not found' }, { status: 404 });
      
      return NextResponse.json({ project: formatProject(matched) });
    }

    const { data, error } = await query;
    if (error) {
      console.error('[New Construction API] Fetch error:', error);
      return NextResponse.json({ projects: [], error: error.message }, { status: 500 });
    }

    const projects = (data ?? []).map(formatProject);
    return NextResponse.json({ projects, _source: 'builder_communities' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg, projects: [] }, { status: 500 });
  }
}
