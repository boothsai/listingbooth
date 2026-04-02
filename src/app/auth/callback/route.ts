export const runtime = 'edge'
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /auth/callback
 *
 * Handles OAuth redirect from Supabase (Google SSO).
 * Per BOOTHS.AI auth-standard: Google OAuth only, one redirectTo URL.
 * After successful auth, redirect to home page.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      
      // If the link included the VOW acceptance flag, stamp the profile
      const isVowAccepted = searchParams.get('vow') === '1';
      if (isVowAccepted) {
        // We use the service_role client for the DB update because the current session cookies aren't attached to standard API fetches yet
        const adminDb = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!
        );
        // Fire and forget update
        adminDb.schema('core_logic').from('user_profiles')
          .update({ vow_terms_accepted_at: new Date().toISOString() })
          .eq('id', data.user.id)
          .then();
      }



      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failure — redirect to agent login with error hint
  return NextResponse.redirect(`${origin}/agent?auth_error=1`);
}
