export const runtime = 'edge';
// src/app/api/lead/event/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { token, event_type } = await req.json();
    if (!token || !event_type) {
      return NextResponse.json({ error: 'token and event_type required' }, { status: 400 });
    }
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!,
      { cookies: { getAll() { return []; }, setAll() {} } }
    );
    const { error } = await supabase
      .schema('core_logic' as any)
      .from('lead_events')
      .insert({
        token,
        event_type,
        ip_address: req.headers.get('x-forwarded-for') ?? '',
        user_agent: req.headers.get('user-agent') ?? ''
      });
    if (error) {
      console.error('Lead event insert error', error);
      return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
    }

    // Telnyx SMS dispatch for hot leads (Edge-compatible fetch API — replaces Node.js Twilio SDK)
    if (event_type === 'form_submit' && process.env.TELNYX_API_KEY) {
      try {
        const { data: linkInfo } = await supabase.schema('core_logic' as any)
          .from('shared_links')
          .select('agent_id')
          .eq('share_token', token)
          .single();

        if (linkInfo?.agent_id) {
          const { data: { user } } = await supabase.auth.admin.getUserById(linkInfo.agent_id);
          
          if (user?.user_metadata?.alert_phone) {
            await fetch('https://api.telnyx.com/v2/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.TELNYX_API_KEY}`,
              },
              body: JSON.stringify({
                from: process.env.TELNYX_PHONE_NUMBER || '+18335551234',
                to: user.user_metadata.alert_phone,
                text: `🚨 BOOTHS.AI LEAD ALERT 🚨\nA client just registered on your Magic Link (Token: ${token}). Log into ListingBooth to see details.`,
              }),
            });
            console.log('Telnyx SMS sent successfully');
          }
        }
      } catch (smsError) {
        console.error('Telnyx SMS Dispatch Error:', smsError);
        // Non-fatal — lead is still recorded
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Lead event handler exception', e);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
