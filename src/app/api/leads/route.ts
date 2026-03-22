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

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message, preferred_date, listing_key, address, price, lead_type } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
    }

    // 1. Upsert contact into mail.contacts
    const { data: contact, error: contactError } = await supabase
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
    const { error: dealError } = await supabase
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
      await supabase
        .schema('mail' as never)
        .from('crm_notes')
        .insert({
          tenant_id: 'listingbooth',
          contact_id: contact.id,
          content: `[ListingBooth] ${lead_type} for ${address ?? listing_key}\n\nPreferred Date: ${preferred_date || 'Flexible'}\n\nMessage: ${message}`,
        });
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
