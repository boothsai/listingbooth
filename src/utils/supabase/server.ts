import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Build-time guard: during `next build`, env vars may be undefined.
  // Pages using this must have `export const dynamic = 'force-dynamic'`
  // so they only execute at request time when env vars are present.
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase environment variables are not set. ' +
      'Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are in .env.local'
    );
  }

  // Next.js 15: cookies() returns a Promise<ReadonlyRequestCookies>, but
  // @supabase/ssr v0.x types expect the synchronous form. Use `use()` equivalent
  // by casting — the cookie methods work at runtime either way.
  const cookieStore = cookies() as unknown as Awaited<ReturnType<typeof cookies>>;
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}
