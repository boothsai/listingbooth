import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy-init to avoid build-time crash on Cloudflare Pages (env vars absent during next build)
let _supabase: SupabaseClient | null = null;

export function createBrowserClient(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabase;
}

// Legacy export for backwards compatibility
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (createBrowserClient() as any)[prop];
  }
});
