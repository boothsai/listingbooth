'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Listing {
  listing_key: string;
  list_price: number;
  address_street: string | null;
  address_city: string | null;
  bedrooms_total: number | null;
  bathrooms_total: number | null;
  photo_urls: string[] | null;
  property_type: string | null;
}

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

export default function DashboardHomePage() {
  const [savedCount, setSavedCount] = useState(0);
  const [recommended, setRecommended] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch favorites count
    fetch('/api/favorites')
      .then(r => r.json())
      .then(d => {
        const favs = d.favorites ?? [];
        setSavedCount(favs.length);
        // Fetch recommendations based on a random saved listing
        if (favs.length > 0) {
          const randomKey = favs[Math.floor(Math.random() * favs.length)];
          return fetch(`/api/recommendations/${randomKey}`).then(r => r.json());
        }
        return { recommendations: [] };
      })
      .then(d => setRecommended(d.recommendations ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {[
          { label: 'Saved Homes', value: savedCount.toString(), icon: '♥', color: '#da291c' },
          { label: 'Saved Searches', value: '—', icon: '🔍', color: '#2563eb' },
          { label: 'Collections', value: '—', icon: '📁', color: '#7c3aed' },
          { label: 'Your Journey', value: 'Active', icon: '🗺️', color: '#059669' },
        ].map(s => (
          <div key={s.label} style={{
            padding: '24px', borderRadius: '16px',
            background: 'white', border: '1.5px solid #eee',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '28px' }}>{s.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: s.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 900, color: '#111', letterSpacing: '-1px' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <Link href="/buy" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 24px', borderRadius: '100px',
          background: '#da291c', color: 'white',
          fontSize: '14px', fontWeight: 800, textDecoration: 'none',
        }}>
          🔍 Browse Listings
        </Link>
        <Link href="/favorites" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 24px', borderRadius: '100px',
          background: 'white', color: '#111', border: '1.5px solid #eee',
          fontSize: '14px', fontWeight: 800, textDecoration: 'none',
        }}>
          ♥ View Saved Homes
        </Link>
        <Link href="/sell" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 24px', borderRadius: '100px',
          background: 'white', color: '#111', border: '1.5px solid #eee',
          fontSize: '14px', fontWeight: 800, textDecoration: 'none',
        }}>
          📊 Get Home Valuation
        </Link>
      </div>

      {/* AI Recommended */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 800, color: '#da291c', letterSpacing: '0.12em', textTransform: 'uppercase' }}>AI POWERED</p>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px', color: '#111' }}>Recommended for You</h2>
          </div>
          <Link href="/buy" style={{ fontSize: '14px', fontWeight: 800, color: '#da291c', textDecoration: 'none' }}>View More →</Link>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: '260px', borderRadius: '16px', background: '#f0f0f0' }} />
            ))}
          </div>
        ) : recommended.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {recommended.map((l: any) => (
              <Link key={l.listing_key} href={`/listing/${l.listing_key}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  borderRadius: '16px', overflow: 'hidden',
                  background: 'white', border: '1.5px solid #eee',
                  transition: 'all 0.3s', cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ height: '160px', background: '#f5f5f5', overflow: 'hidden' }}>
                    {l.photo_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={l.photo_url} alt={l.title ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>🏡</div>
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>
                      {formatPrice(l.price)}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#666', fontWeight: 500 }}>
                      {l.address ?? l.title ?? 'Property'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ padding: '48px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1.5px solid #eee' }}>
            <p style={{ fontSize: '40px', marginBottom: '16px' }}>💡</p>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 900, color: '#111' }}>Save some homes to unlock AI recommendations</h3>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#666' }}>The more homes you save, the smarter our recommendations get.</p>
            <Link href="/buy" style={{ background: '#da291c', color: 'white', padding: '12px 24px', borderRadius: '100px', fontSize: '14px', fontWeight: 800, textDecoration: 'none' }}>
              Start Browsing →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
