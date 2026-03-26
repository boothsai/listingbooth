export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { getListingById } from '@/lib/supabase/ddf';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = await getListingById(id);
  
  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  // VOW Gateway Protection
  // Establish secure server-side connection to verify if user explicitly logged in
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Next.js Route Handlers throw if setting cookies inside a Server Component context,
            // but harmless to suppress here in an API route read-check
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // If no user is logged in, forcefully redact VOW protected fields
  if (!user) {
    const listingData = listing as any;
    // Redact sold price
    if (listingData.sold_price) {
      listingData.sold_price = null;
      // We append a frontend flag so the UX knows it hit the VOW wall
      listingData._vow_locked = true; 
    }
    // Also redact private remarks or showing instructions if they were fetched
    if (listingData.private_remarks) listingData.private_remarks = null;
    if (listingData.history) listingData.history = null;
  }

  return NextResponse.json(listing);
  } catch (error: any) {
    console.error('Listings API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
