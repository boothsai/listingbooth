export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { listingKey } = await req.json();

    if (!listingKey) {
      return NextResponse.json({ error: 'listingKey is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() { /* route handler */ }
        }
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a secure 8-character token using Web Crypto API (Edge-compatible)
    const randomBytes = new Uint8Array(4);
    crypto.getRandomValues(randomBytes);
    const token = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    // Insert into core_logic.shared_links
    const { error } = await supabase
      .schema('core_logic' as any)
      .from('shared_links')
      .insert({
        listing_key: listingKey,
        agent_id: user.id,
        share_token: token
      });

    if (error) {
      console.error('[API Share] Error creating link', error);
      return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
    }

    const host = req.headers.get('host') || 'listingbooth.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const shortUrl = `${protocol}://${host}/share/${token}`;

    return NextResponse.json({ url: shortUrl });

  } catch (error) {
    console.error('[API Share] Internal Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
