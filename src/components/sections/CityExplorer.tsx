'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MarketCity {
  name: string;
  subtitle: string;
  colSpan: number;
  count: number;
}

// City names and subtitles are editorial/navigational — not fabricated data.
// Listing counts are wired live from the API.
const CITY_CONFIG = [
  { name: 'Toronto', subtitle: '#1 Market', colSpan: 2 },
  { name: 'Ottawa', subtitle: 'The Capital', colSpan: 2 },
  { name: 'Kanata', subtitle: 'Silicon Valley North', colSpan: 1 },
  { name: 'Orleans', subtitle: 'East End Living', colSpan: 1 },
  { name: 'Nepean', subtitle: 'Family Communities', colSpan: 1 },
  { name: 'Barrhaven', subtitle: 'South Growth', colSpan: 1 },
  { name: 'Mississauga', subtitle: 'The 905 Powerhouse', colSpan: 2 },
  { name: 'Oakville', subtitle: 'Luxury Lakefront', colSpan: 2 },
];

export default function CityExplorer() {
  const [markets, setMarkets] = useState<MarketCity[]>(
    CITY_CONFIG.map(c => ({ ...c, count: 0 }))
  );

  useEffect(() => {
    // Wired-First Doctrine: fetch real listing counts per city
    async function loadCounts() {
      const updated = await Promise.all(
        CITY_CONFIG.map(async (city) => {
          try {
            const res = await fetch(`/api/listings?city=${encodeURIComponent(city.name)}&limit=0`);
            const data = await res.json();
            return { ...city, count: data.total ?? data.listings?.length ?? 0 };
          } catch {
            return { ...city, count: 0 };
          }
        })
      );
      setMarkets(updated);
    }
    loadCounts();
  }, []);

  // Generate a deterministic gradient from the city name so we don't need stock images
  function cityGradient(name: string): string {
    const gradients: Record<string, string> = {
      'Toronto': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      'Ottawa': 'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)',
      'Kanata': 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      'Orleans': 'linear-gradient(135deg, #200122 0%, #6f0000 100%)',
      'Nepean': 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      'Barrhaven': 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
      'Mississauga': 'linear-gradient(135deg, #0c0c0c 0%, #1c1c1c 50%, #3a3a3a 100%)',
      'Oakville': 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
    };
    return gradients[name] || 'linear-gradient(135deg, #111 0%, #333 100%)';
  }

  return (
    <section style={{ padding: '120px 5%', backgroundColor: '#0a0a0a', position: 'relative' }}>
      
      {/* Background glow */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', height: '500px', background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)', zIndex: 0 }} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        <div style={{ textAlign: 'center', marginBottom: '80px', maxWidth: '800px', margin: '0 auto 80px' }}>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, margin: '0 0 24px', letterSpacing: '-0.04em', lineHeight: 1.05, color: 'white' }}>
            Explore Ontario Markets
          </h2>
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
            Take a hyper-local dive into specific neighborhoods powered by real-time DDF data.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '24px',
          gridAutoRows: '280px'
        }}>
          {markets.map((c) => (
            <Link key={c.name} href={`/buy?city=${encodeURIComponent(c.name)}`}
              style={{
                textDecoration: 'none', color: 'inherit',
                gridColumn: `span ${c.colSpan}`,
                borderRadius: '24px',
                position: 'relative',
                overflow: 'hidden',
                display: 'block',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 32px 64px rgba(0,0,0,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 24px 48px rgba(0,0,0,0.5)'; }}
            >
              {/* Gradient background instead of stock photos */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: cityGradient(c.name),
                zIndex: 0
              }} />
              
              {/* Dark Gradient Overlay */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%)',
                pointerEvents: 'none', zIndex: 1
              }} />

              {/* Text Content */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '32px', zIndex: 2, pointerEvents: 'none'
              }}>
                <h3 style={{ margin: '0 0 8px', fontSize: c.colSpan === 2 ? '36px' : '28px', fontWeight: 900, color: 'white', letterSpacing: '-1px', lineHeight: 1.1 }}>
                  {c.name}
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'inline-flex', padding: '6px 12px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '100px', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                    {c.subtitle}
                  </div>
                  {c.count > 0 && (
                    <div style={{ display: 'inline-flex', padding: '6px 12px', background: 'rgba(218,41,28,0.3)', backdropFilter: 'blur(10px)', borderRadius: '100px', fontSize: '12px', fontWeight: 800, color: '#fff' }}>
                      {c.count.toLocaleString()} listings
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
