export const runtime = 'edge'
/**
 * POST /api/leads
 *
 * Stores a lead (Book Showing / Request Info) into:
 * 1. mail.contacts — creates or updates the contact
 * 2. mail.crm_deals — creates a deal linked to the listing
 *
 * DDF/VOW Compliance: leads are tagged with tenant_id='listingbooth'
 * and stage='Lead' for routing to the eXp Realty agent.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Lazy initialization — prevents build-time crash when env vars aren't loaded
let _sb: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_sb) {
    _sb = createClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
  }
  return _sb;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message, preferred_date, listing_key, address, price, lead_type } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
    }

    // 1. Upsert contact into mail.contacts
    const { data: contact, error: contactError } = await getSupabase()
      .schema('mail' as never)
      .from('contacts')
      .upsert({
        tenant_id: 'listingbooth',
        name,
        email,
        phone: phone || null,
        stage: 'Lead',
      }, { onConflict: 'email' })
      .select('id')
      .single();

    if (contactError) {
      console.error('[leads] contact upsert error:', contactError.message);
      // Non-fatal — continue to create deal record
    }

    // 2. Create a deal in mail.crm_deals
    const dealName = `${lead_type ?? 'Lead'} — ${address ?? listing_key ?? 'Unknown Property'}`;
    const { error: dealError } = await getSupabase()
      .schema('mail' as never)
      .from('crm_deals')
      .insert({
        tenant_id: 'listingbooth',
        name: dealName,
        price: price ? Number(String(price).replace(/[^0-9.]/g, '')) : 0,
        stage: 'Lead',
        contact_id: contact?.id ?? null,
        closing_date: preferred_date || null,
      });

    if (dealError) {
      console.error('[leads] deal insert error:', dealError.message);
    }

    // 3. Add a note with the full context
    if (contact?.id && message) {
      await getSupabase()
        .schema('mail' as never)
        .from('crm_notes')
        .insert({
          tenant_id: 'listingbooth',
          contact_id: contact.id,
          content: `[ListingBooth] ${lead_type} for ${address ?? listing_key}\n\nPreferred Date: ${preferred_date || 'Flexible'}\n\nMessage: ${message}`,
        });
    }

    // 4. THE GHOST KILLER: Telnyx SMS Auto-Responder
    if (process.env.TELNYX_API_KEY && process.env.TELNYX_PHONE_NUMBER && phone) {
      try {
        await fetch('https://api.telnyx.com/v2/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TELNYX_API_KEY}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            from: process.env.TELNYX_PHONE_NUMBER,
            to: phone,
            text: `Hi ${name.split(' ')[0]}, this is the BOOTHS.AI Concierge. We've received your inquiry for ${address ?? listing_key}. An agent is reviewing your request and will reach out shortly!`
          })
        });
      } catch (telnyxErr) {
        console.error('[leads] telnyx SMS failed:', telnyxErr);
      }
    }

    // 5. RESEND API: Instantly acknowledge via email
    if (process.env.RESEND_API_KEY && email) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: 'BOOTHS.AI Concierge <concierge@listingbooth.com>',
            to: [email],
            subject: `Request Received: ${address ?? listing_key}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #111;">Hi ${name.split(' ')[0]},</h2>
                <p style="color: #444; font-size: 16px;">Thanks for reaching out! We've successfully received your ${lead_type ?? 'inquiry'} for <strong>${address ?? listing_key}</strong>.</p>
                <p style="color: #444; font-size: 16px;">Your dedicated real estate professional is currently reviewing the details and will contact you back using this email thread.</p>
                <br/>
                <p style="color: #888; font-size: 14px;">Powered by the BOOTHS.AI Network.</p>
              </div>
            `
          })
        });
      } catch (resendErr) {
        console.error('[leads] resend email failed:', resendErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Lead captured. An eXp Realty agent will follow up within 24 hours.',
      _compliance: { brokered_by: 'eXp Realty Canada', tenant: 'listingbooth' },
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[leads] unexpected error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
