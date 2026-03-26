export const runtime = 'edge'
import { NextResponse } from 'next/server';
import { getFeaturedListings } from '@/lib/supabase/ddf';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const listings = await getFeaturedListings(6);
    return NextResponse.json({ listings });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
