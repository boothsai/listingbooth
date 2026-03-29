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
      .from('vip_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (city) query = query.eq('city', city);
    if (status) query = query.eq('status', status);
    
    if (slug) {
      const { data, error } = await query.eq('slug', slug).single();
      if (error) {
        console.error('[New Construction API] Slug fetch error:', error);
        return NextResponse.json({ project: null, error: error.message }, { status: 404 });
      }
      return NextResponse.json({ project: data });
    }

    const { data, error } = await query;
    if (error) {
      console.error('[New Construction API] Fetch error:', error);
      return NextResponse.json({ projects: [], error: error.message }, { status: 500 });
    }

    return NextResponse.json({ projects: data ?? [], _source: 'vip_projects' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg, projects: [] }, { status: 500 });
  }
}
