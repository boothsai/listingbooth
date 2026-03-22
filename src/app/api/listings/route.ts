/**
 * GET /api/listings
 *
 * DDF/VOW Compliance enforced:
 * - Only vow_allowed = true listings are returned (CREA DDF rule)
 * - private_remarks are never exposed (VOW privacy rule)
 * - Brokered by eXp Realty attribution is embedded in each response record
 */
import { NextRequest, NextResponse } from 'next/server';
import { searchListings } from '@/lib/supabase/ddf';

export async function GET(req: NextRequest) {
  try {
    const s = req.nextUrl.searchParams;
    const result = await searchListings({
      q: s.get('q') ?? undefined,
      city: s.get('city') ?? undefined,
      province: s.get('province') ?? undefined,
      min_price: s.get('min_price') ? Number(s.get('min_price')) : undefined,
      max_price: s.get('max_price') ? Number(s.get('max_price')) : undefined,
      beds: s.get('beds') ? Number(s.get('beds')) : undefined,
      baths: s.get('baths') ? Number(s.get('baths')) : undefined,
      type: s.get('type') ?? undefined,
      status: s.get('status') ?? undefined,
      page: s.get('page') ? Number(s.get('page')) : 1,
      limit: s.get('limit') ? Number(s.get('limit')) : 12,
    });

    // VOW Compliance: strip private_remarks from all public responses
    // private_remarks are agent-only and must never be exposed over a public API
    const sanitized = result.listings.map(l => {
      // Destructure to drop private_remarks; spread the rest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { private_remarks: _pr, ...safe } = l as any;
      void _pr; // suppress unused variable warning
      return safe;
    });

    return NextResponse.json({
      ...result,
      listings: sanitized,
      // DDF compliance metadata
      _compliance: {
        brokered_by: 'eXp Realty Canada',
        data_source: 'CREA DDF®',
        trademarks: 'MLS®, REALTOR®, REALTORS®, DDF® are trademarks of CREA',
        vow_compliant: true,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
