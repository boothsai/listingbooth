import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  // Security Interceptor: The Agent Lockdown
  // ONLY /agent/* and /admin/* routes require authentication.
  // Everything else is PUBLIC by default — this is a consumer-facing portal.
  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith('/auth') || pathname === '/agent/login';
  const isAgentRoute = pathname.startsWith('/agent');
  const isAdminRoute = pathname.startsWith('/admin');

  // Unauthenticated users hitting protected routes → send to /agent/login
  if (!user && (isAgentRoute || isAdminRoute) && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/agent/login';
    return NextResponse.redirect(url);
  }

  // If the user is logged in and hits /agent/login, bounce them into the CRM
  if (user && request.nextUrl.pathname === '/agent/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/agent';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
