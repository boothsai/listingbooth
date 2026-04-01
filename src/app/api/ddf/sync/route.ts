export const runtime = 'edge';

/**
 * POST /api/ddf/sync — Trigger a DDF sync run
 * 
 * Protected by a secret key to prevent unauthorized syncs.
 * Can be called by:
 *   - Cloudflare Worker cron trigger
 *   - Admin dashboard manual trigger
 *   - curl with auth header
 * 
 * Example:
 *   curl -X POST https://listingbooth.com/api/ddf/sync \
 *     -H "Authorization: Bearer $SYNC_SECRET"
 */

import { NextRequest, NextResponse } from 'next/server';
import { DdfSyncEngine } from '@/lib/ddf/sync-engine';

export async function POST(req: NextRequest) {
  // Auth check — require sync secret
  const authHeader = req.headers.get('authorization');
  const syncSecret = process.env.DDF_SYNC_SECRET || process.env.SUPABASE_SERVICE_KEY;

  if (!authHeader || !authHeader.includes(syncSecret?.slice(0, 20) || '__NOKEY__')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check for required DDF credentials
  const ddfApiUrl = process.env.DDF_API_URL;
  const ddfToken = process.env.DDF_BEARER_TOKEN;

  if (!ddfApiUrl || !ddfToken) {
    return NextResponse.json({
      error: 'DDF credentials not configured',
      help: 'Set DDF_API_URL and DDF_BEARER_TOKEN in Cloudflare Pages environment variables',
      status: 'waiting_for_credentials',
    }, { status: 503 });
  }

  try {
    const engine = new DdfSyncEngine({
      reso: {
        apiUrl: ddfApiUrl,
        bearerToken: ddfToken,
      },
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
      supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!,
      boards: ['OREB', 'TRREB'],
      batchSize: 200,
      maxListings: 50000,
    });

    const result = await engine.sync();

    return NextResponse.json({
      ...result,
      _message: result.success
        ? `Sync complete: ${result.inserted} new, ${result.updated} updated`
        : `Sync finished with ${result.errors} errors`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown sync error';
    console.error('[DDF-SYNC] Fatal error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  // Health check — show sync status without triggering
  return NextResponse.json({
    status: 'ready',
    configured: !!process.env.DDF_API_URL,
    boards: ['OREB', 'TRREB'],
    _help: 'POST to this endpoint to trigger a sync',
  });
}
