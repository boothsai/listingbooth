export const runtime = 'edge'
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

/**
 * POST /api/ghost-alert
 * 
 * Ghost Agent SMS Alert System:
 * When a new listing hits the market that matches a user's saved search criteria,
 * this endpoint sends a proactive SMS via Telnyx.
 * 
 * Body: { phone: string, listingAddress: string, listingPrice: number, listingKey: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, listingAddress, listingPrice, listingKey } = body;

    if (!phone || !listingAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const formattedPrice = listingPrice >= 1_000_000 
      ? `$${(listingPrice / 1_000_000).toFixed(2)}M` 
      : `$${Number(listingPrice).toLocaleString()}`;

    const message = `🏠 ListingBooth Alert!\n\nA new property just listed at ${listingAddress} for ${formattedPrice}.\n\nBased on your saved preferences, this could be a match. Want me to book a showing for tomorrow?\n\n👉 View: https://listingbooth.com/listing/${listingKey}\n\n— Your Ghost Agent, VABOT`;

    // Send via Telnyx
    const telnyxKey = process.env.TELNYX_API_KEY;
    if (telnyxKey) {
      const telnyxResponse = await fetch('https://api.telnyx.com/v2/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${telnyxKey}`,
        },
        body: JSON.stringify({
          from: process.env.TELNYX_PHONE_NUMBER || '+18335551234',
          to: phone,
          text: message,
        }),
      });

      if (!telnyxResponse.ok) {
        const errorText = await telnyxResponse.text();
        console.error('[Ghost Alert] Telnyx error:', errorText);
        return NextResponse.json({ error: 'SMS delivery failed', details: errorText }, { status: 502 });
      }
    }

    // Log the alert to Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    await supabase.schema('core_logic' as any).from('lead_activity').insert({
      lead_id: null, // Will be linked when we match phone to lead
      activity_type: 'Ghost Agent SMS Sent',
      metadata: { phone, listingAddress, listingPrice, listingKey, sentAt: new Date().toISOString() },
    });

    return NextResponse.json({ success: true, message: 'Ghost alert sent' });
  } catch (error) {
    console.error('[Ghost Alert] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
