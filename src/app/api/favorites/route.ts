export const runtime = 'edge'
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized. Must be logged in to save homes.' }, { status: 401 });
    }

    const { listing_key } = await req.json();

    if (!listing_key) {
      return NextResponse.json({ error: 'listing_key is required' }, { status: 400 });
    }

    // Check if it already exists to toggle it
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_key', listing_key)
      .single();

    if (existing) {
      // Un-favorite
      await supabase.from('user_favorites').delete().eq('id', existing.id);
      return NextResponse.json({ success: true, saved: false });
    } else {
      // Favorite
      await supabase.from('user_favorites').insert({ user_id: user.id, listing_key });
      return NextResponse.json({ success: true, saved: true });
    }

  } catch (err: any) {
    console.error('[favorites] API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ favorites: [] });
    }

    const { data } = await supabase.from('user_favorites').select('listing_key').eq('user_id', user.id);
    return NextResponse.json({ favorites: data?.map(d => d.listing_key) || [] });

  } catch (err) {
    return NextResponse.json({ favorites: [] });
  }
}
