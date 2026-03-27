'use client';
import Link from 'next/link';

const MARKETS = [
  { name: 'Toronto', subtitle: '#1 Market', colSpan: 2, img: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&q=80&w=800' },
  { name: 'Ottawa', subtitle: 'The Capital', colSpan: 2, img: 'https://images.unsplash.com/photo-1582650505165-2234026da6f0?auto=format&fit=crop&q=80&w=800' },
  { name: 'Kanata', subtitle: 'Silicon Valley North', colSpan: 1, img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800' },
  { name: 'Orleans', subtitle: 'East End Living', colSpan: 1, img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800' },
  { name: 'Nepean', subtitle: 'Family Communities', colSpan: 1, img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800' },
  { name: 'Barrhaven', subtitle: 'South Growth', colSpan: 1, img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800' },
  { name: 'Mississauga', subtitle: 'The 905 Powerhouse', colSpan: 2, img: 'https://images.unsplash.com/photo-1583847268964-b28e50b58b34?auto=format&fit=crop&q=80&w=800' },
  { name: 'Oakville', subtitle: 'Luxury Lakefront', colSpan: 2, img: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&q=80&w=800' },
];

export default function CityExplorer() {
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
          {MARKETS.map((c) => (
            <Link key={c.name} href={`/buy?city=${encodeURIComponent(c.name)}`}
              style={{
                textDecoration: 'none', color: 'inherit',
                gridColumn: `span ${c.colSpan}`,
                borderRadius: '24px',
                position: 'relative',
                overflow: 'hidden',
                display: 'block',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
              }}
            >
              {/* Background Image */}
              <div 
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: `url(${c.img}) center/cover`,
                  transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  zIndex: 0
                }} 
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
              
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
                <div style={{ display: 'inline-flex', padding: '6px 12px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '100px', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                  {c.subtitle}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
