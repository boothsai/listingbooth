'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Listing {
  listing_key: string;
  list_price: number;
  property_type: string | null;
  bedrooms_total: number | null;
  bathrooms_total: number | null;
  living_area: number | null;
  address_city: string | null;
  address_street: string | null;
  photo_urls: string[] | null;
  days_on_market: number | null;
  updated_at: string;
}

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

export default function FeaturedListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/listings?limit=6&sort=newest')
      .then(r => r.json())
      .then(d => setListings(d.listings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section style={{ padding: '80px 24px', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 800, color: '#da291c', letterSpacing: '0.15em', textTransform: 'uppercase' }}>JUST LISTED</p>
          <h2 style={{ margin: '0 0 40px', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, color: '#111', letterSpacing: '-2px', lineHeight: 1.1 }}>Featured Listings</h2>
          <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '12px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ minWidth: '340px', height: '380px', borderRadius: '20px', background: 'linear-gradient(90deg, #f3f3f3 25%, #e8e8e8 37%, #f3f3f3 63%)', backgroundSize: '400% 100%', flexShrink: 0 }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (listings.length === 0) return null;

  return (
    <section style={{ padding: '80px 24px', backgroundColor: '#fafafa' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 800, color: '#da291c', letterSpacing: '0.15em', textTransform: 'uppercase' }}>JUST LISTED</p>
            <h2 style={{ margin: 0, fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, color: '#111', letterSpacing: '-2px', lineHeight: 1.1 }}>Featured Listings</h2>
          </div>
          <Link href="/buy" style={{ fontSize: '15px', fontWeight: 800, color: '#da291c', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All Listings →
          </Link>
        </div>

        <div style={{
          display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '12px',
          scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
        }}>
          {listings.map(l => (
            <Link key={l.listing_key} href={`/listing/${encodeURIComponent(l.listing_key)}`} style={{ textDecoration: 'none', color: 'inherit', scrollSnapAlign: 'start', flexShrink: 0 }}>
              <div style={{
                width: '340px', borderRadius: '20px', overflow: 'hidden',
                background: 'white', border: '1.5px solid #eee',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Photo with price overlay */}
                <div style={{ height: '220px', position: 'relative', overflow: 'hidden', background: '#f0f0f0' }}>
                  {l.photo_urls?.[0] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={l.photo_urls[0]} alt={l.address_street ?? 'Property'} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '48px' }}>🏡</div>
                  )}
                  {/* Price overlay */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    padding: '40px 20px 16px',
                  }}>
                    <span style={{ fontSize: '28px', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>
                      {formatPrice(l.list_price)}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '20px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600, color: '#333' }}>
                    {l.address_street ?? 'Address Unavailable'}{l.address_city ? `, ${l.address_city}` : ''}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#888', fontWeight: 600 }}>
                    {(l.bedrooms_total ?? 0) > 0 && <span>{l.bedrooms_total} Bed</span>}
                    {(l.bathrooms_total ?? 0) > 0 && <span>{l.bathrooms_total} Bath</span>}
                    {l.living_area && <span>{Math.round(l.living_area).toLocaleString()} sqft</span>}
                    <span>{l.property_type ?? 'Property'}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
