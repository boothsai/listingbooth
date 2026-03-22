import { NextRequest, NextResponse } from 'next/server';
import { getMarketStats } from '@/lib/supabase/ddf';

export async function GET(req: NextRequest) {
  try {
    const city = req.nextUrl.searchParams.get('city') ?? 'Ottawa';
    const stats = await getMarketStats(city);
    return NextResponse.json(stats);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
