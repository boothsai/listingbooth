export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ collections: [] });

    const { data: collections } = await supabase
      .from('user_collections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!collections || collections.length === 0) {
      return NextResponse.json({ collections: [] });
    }

    // Fetch items for each collection
    const collectionIds = collections.map(c => c.id);
    const { data: items } = await supabase
      .from('user_collection_items')
      .select('*')
      .in('collection_id', collectionIds)
      .order('position', { ascending: true });

    const enriched = collections.map(c => ({
      ...c,
      items: (items ?? []).filter(i => i.collection_id === c.id),
    }));

    return NextResponse.json({ collections: enriched });
  } catch {
    return NextResponse.json({ collections: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // If listing_key is provided, add item to collection
    if (body.collection_id && body.listing_key) {
      const { data, error } = await supabase
        .from('user_collection_items')
        .insert({
          collection_id: body.collection_id,
          listing_key: body.listing_key,
          notes: body.notes ?? null,
          position: body.position ?? 0,
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ item: data });
    }

    // Otherwise, create a new collection
    if (!body.name) return NextResponse.json({ error: 'name required' }, { status: 400 });

    const shareToken = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

    const { data, error } = await supabase
      .from('user_collections')
      .insert({
        user_id: user.id,
        name: body.name,
        share_token: shareToken,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ collection: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    // Delete items first, then collection (cascade)
    await supabase
      .from('user_collection_items')
      .delete()
      .eq('collection_id', id);

    await supabase
      .from('user_collections')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 });
  }
}
