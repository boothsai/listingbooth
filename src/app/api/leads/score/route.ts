export const runtime = 'edge';
/**
 * POST /api/leads/score
 *
 * Automatic Lead Scoring Engine.
 * Calculates a Hot/Warm/Cold score based on consumer behavior signals:
 * - Property views count
 * - Favorites count
 * - Registration method (SSO vs manual)
 * - Phone number provided
 * - Chat interactions
 * - Time since registration
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

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

export async function POST(req: NextRequest) {
  try {
    const { user_id, email } = await req.json();

    if (!user_id && !email) {
      return NextResponse.json({ error: 'user_id or email required' }, { status: 400 });
    }

    let score = 0;
    const signals: string[] = [];

    // 1. Count favorites
    const { count: favCount } = await getSupabase()
      .from('user_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id);
    
    if (favCount && favCount > 0) {
      score += Math.min(favCount * 10, 30); // Max 30 points from favorites
      signals.push(`${favCount} saved homes (+${Math.min(favCount * 10, 30)})`);
    }

    // 2. Check if phone was provided (indicates high intent)
    const { data: contact } = await getSupabase()
      .schema('mail' as never)
      .from('contacts')
      .select('phone, created_at')
      .eq('email', email)
      .single();

    if (contact?.phone) {
      score += 25;
      signals.push('Phone provided (+25)');
    }

    // 3. Check for existing deals (already submitted forms)
    const { count: dealCount } = await getSupabase()
      .schema('mail' as never)
      .from('crm_deals')
      .select('*', { count: 'exact', head: true })
      .eq('contact_id', user_id);

    if (dealCount && dealCount > 0) {
      score += dealCount * 15; // 15 points per deal interaction
      signals.push(`${dealCount} deal${dealCount > 1 ? 's' : ''} (+${dealCount * 15})`);
    }

    // 4. Check chat messages (engaged lead)
    const { count: chatCount } = await getSupabase()
      .from('unity_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_role', 'lead')
      .limit(10);

    if (chatCount && chatCount > 0) {
      score += Math.min(chatCount * 5, 20);
      signals.push(`${chatCount} chat messages (+${Math.min(chatCount * 5, 20)})`);
    }

    // 5. Determine temperature
    let temperature: 'Hot' | 'Warm' | 'Cold';
    if (score >= 50) {
      temperature = 'Hot';
    } else if (score >= 20) {
      temperature = 'Warm';
    } else {
      temperature = 'Cold';
    }

    return NextResponse.json({
      user_id,
      score,
      temperature,
      signals,
      threshold: { hot: '50+', warm: '20-49', cold: '0-19' },
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[leads/score] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
