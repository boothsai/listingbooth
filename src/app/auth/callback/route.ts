export const runtime = 'edge'
import { createServerClient } from '@supabase/ssr';
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
    const cookieStore = await cookies();
    const supabase = createServerClient(
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
      // Fire off webhook / email drip if we have a token
      const t = searchParams.get('t');
      if (t) {
        try {
          // Look up agent
          const { data: linkInfo } = await supabase.schema('core_logic' as any)
            .from('shared_links')
            .select('agent_id')
            .eq('share_token', t)
            .single();
            
          if (linkInfo && linkInfo.agent_id) {
            await fetch(`${origin}/api/email/welcome-drip`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: data.user.email,
                firstName: data.user.user_metadata?.full_name?.split(' ')[0] || '',
                agentId: linkInfo.agent_id,
                token: t
              })
            });
          }
        } catch (e) {
          console.error('Failed to trigger background drip campaign:', e);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failure — redirect to agent login with error hint
  return NextResponse.redirect(`${origin}/agent?auth_error=1`);
}
