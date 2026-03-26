export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'My Saved Homes | ListingBooth',
  description: 'View and manage all the properties you\'ve saved on ListingBooth.',
  robots: { index: false },
};

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

export default async function FavoritesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/agent/login');

  // Fetch saved listing keys
  const { data: favorites } = await supabase
    .from('user_favorites')
    .select('listing_key, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const listingKeys = (favorites || []).map(f => f.listing_key);

  // Fetch full listing data from DDF
  let listings: any[] = [];
  if (listingKeys.length > 0) {
    const ddf = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!,
      { db: { schema: 'res_ddf' } }
    );
    const { data } = await ddf
      .from('listings')
      .select('listing_key, address_street, address_city, list_price, property_type, bedrooms_total, bathrooms_total, photo_urls, is_active')
      .in('listing_key', listingKeys);
    listings = data || [];
  }

  // Order them by the user's save order
  const orderedListings = listingKeys
    .map(key => listings.find(l => l.listing_key === key))
    .filter(Boolean);

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#fafafa', paddingTop: '110px' }}>
      
      {/* Header */}
      <div style={{ backgroundColor: '#111', padding: '48px 40px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 800, color: '#da291c', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Your Collection</p>
        <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: 'white', letterSpacing: '-2px', lineHeight: 1.1 }}>
          Saved Homes
        </h1>
        <p style={{ margin: 0, fontSize: '16px', color: '#888' }}>
          {orderedListings.length === 0 ? 'You haven\'t saved any homes yet.' : `${orderedListings.length} saved ${orderedListings.length === 1 ? 'home' : 'homes'}`}
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '48px auto', padding: '0 40px' }}>

        {orderedListings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🏡</div>
            <h2 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 900, color: '#111' }}>Start Exploring</h2>
            <p style={{ margin: '0 0 32px', fontSize: '15px', color: '#666', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
              Browse listings and tap the heart icon to save homes you love. They&apos;ll appear here for easy comparison.
            </p>
            <Link href="/buy" style={{ background: '#da291c', color: 'white', padding: '14px 28px', borderRadius: '10px', fontSize: '15px', fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 16px rgba(218,41,28,0.3)' }}>
              Browse Homes
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {orderedListings.map((l: any) => (
              <Link key={l.listing_key} href={`/listing/${l.listing_key}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  background: 'white', borderRadius: '16px', overflow: 'hidden',
                  border: '1.5px solid #e5e5e5', transition: 'all 0.2s',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                }}>
                  {/* Photo */}
                  <div style={{ height: '200px', background: '#111', position: 'relative' }}>
                    {l.photo_urls?.[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={l.photo_urls[0]} alt={l.address_street || 'Property'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '14px' }}>
                        No Photo
                      </div>
                    )}
                    {/* Status pill */}
                    <div style={{
                      position: 'absolute', top: '12px', left: '12px',
                      background: l.is_active ? '#22c55e' : '#888',
                      color: 'white', fontSize: '11px', fontWeight: 800,
                      padding: '4px 10px', borderRadius: '100px',
                      textTransform: 'uppercase', letterSpacing: '0.06em'
                    }}>
                      {l.is_active ? 'Active' : 'Inactive'}
                    </div>
                    {/* Saved heart */}
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: 'rgba(218,41,28,0.9)', color: 'white',
                      width: '32px', height: '32px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px'
                    }}>
                      ♥
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '20px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 900, color: '#111', letterSpacing: '-1px' }}>
                      {formatPrice(l.list_price)}
                    </p>
                    <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#555', fontWeight: 500 }}>
                      {l.address_street || 'Address unavailable'}{l.address_city ? `, ${l.address_city}` : ''}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#888', fontWeight: 600 }}>
                      {l.bedrooms_total && <span>{l.bedrooms_total} Bed</span>}
                      {l.bathrooms_total && <span>{l.bathrooms_total} Bath</span>}
                      <span>{l.property_type || 'Property'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
