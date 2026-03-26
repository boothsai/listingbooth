export const runtime = 'edge';
/**
 * PATCH /api/deals/stage
 *
 * Advances a CRM deal through the real estate lifecycle pipeline.
 * Stages: Lead → Showing → Active Client → Offer → Negotiation → Sold Firm → Sold → Nurture
 *
 * POST body: { deal_id: string, stage: string, notes?: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const VALID_STAGES = [
  'Lead',
  'Showing Booked',
  'Active Client',
  'Offer Submitted',
  'Negotiation',
  'Sold Firm',
  'Sold',
  'Nurture',
] as const;

let _sb: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_sb) {
    _sb = createClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!,
      { auth: { persistSession: false } }
    );
  }
  return _sb;
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { deal_id, stage, notes } = body;

    if (!deal_id || !stage) {
      return NextResponse.json({ error: 'deal_id and stage are required' }, { status: 400 });
    }

    if (!VALID_STAGES.includes(stage)) {
      return NextResponse.json({
        error: `Invalid stage. Valid stages: ${VALID_STAGES.join(', ')}`,
      }, { status: 400 });
    }

    // 1. Update the deal stage
    const { error: updateError } = await getSupabase()
      .schema('mail' as never)
      .from('crm_deals')
      .update({ stage, updated_at: new Date().toISOString() })
      .eq('id', deal_id);

    if (updateError) {
      console.error('[deals/stage] update error:', updateError.message);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 2. If notes are provided, append a stage transition note
    if (notes) {
      // Fetch contact_id from the deal
      const { data: deal } = await getSupabase()
        .schema('mail' as never)
        .from('crm_deals')
        .select('contact_id')
        .eq('id', deal_id)
        .single();

      if (deal?.contact_id) {
        await getSupabase()
          .schema('mail' as never)
          .from('crm_notes')
          .insert({
            tenant_id: 'listingbooth',
            contact_id: deal.contact_id,
            content: `[Stage Change → ${stage}] ${notes}`,
          });
      }
    }

    // 3. If the deal just advanced to "Sold", trigger the Nurture pipeline flag
    if (stage === 'Sold') {
      // Auto-schedule post-sale nurture in 30 days
      const { data: deal } = await getSupabase()
        .schema('mail' as never)
        .from('crm_deals')
        .select('contact_id, name')
        .eq('id', deal_id)
        .single();

      if (deal?.contact_id) {
        await getSupabase()
          .schema('mail' as never)
          .from('crm_notes')
          .insert({
            tenant_id: 'listingbooth',
            contact_id: deal.contact_id,
            content: `[AUTO] 🎉 Deal "${deal.name}" closed. Post-sale nurture campaign will begin in 30 days. Anniversary, referral, and market update emails will be triggered automatically.`,
          });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Deal advanced to "${stage}"`,
      _pipeline: VALID_STAGES,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[deals/stage] unexpected error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
