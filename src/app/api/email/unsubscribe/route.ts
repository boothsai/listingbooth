export const runtime = 'edge';
import { NextResponse } from 'next/server';
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

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const email = formData.get('email')?.toString();

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    // Mark the contact as unsubscribed in the CRM
    await getSupabase()
      .schema('mail' as never)
      .from('contacts')
      .update({ stage: 'Unsubscribed' })
      .eq('email', email);

    // Redirect back to the unsubscribe page with success
    return NextResponse.redirect(
      new URL(`/unsubscribe?email=${encodeURIComponent(email)}&success=1`, req.url),
      303
    );
  } catch (err: any) {
    console.error('[unsubscribe] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
