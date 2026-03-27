'use client';

import Link from 'next/link';

const CITIES = [
  { name: 'Toronto', subtitle: 'Ontario\'s Largest Market', listings: '12,000+', gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { name: 'Ottawa', subtitle: 'Canada\'s Capital', listings: '3,500+', gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
  { name: 'Mississauga', subtitle: 'The 905 Powerhouse', listings: '2,800+', gradient: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)' },
  { name: 'Oakville', subtitle: 'Luxury Lakefront Living', listings: '1,200+', gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
  { name: 'Vaughan', subtitle: 'North of Toronto', listings: '1,800+', gradient: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)' },
  { name: 'Hamilton', subtitle: 'The Affordable Alternative', listings: '2,100+', gradient: 'linear-gradient(135deg, #373b44 0%, #4286f4 100%)' },
  { name: 'London', subtitle: 'Southwestern Ontario', listings: '1,600+', gradient: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)' },
  { name: 'Barrie', subtitle: 'Cottage Country Gateway', listings: '900+', gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
];

export default function CityExplorer() {
  return (
    <section style={{ padding: '80px 24px', backgroundColor: '#111' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 800, color: '#da291c', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            EXPLORE ONTARIO
          </p>
          <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, color: 'white', letterSpacing: '-2px', lineHeight: 1.1 }}>
            Search by City
          </h2>
          <p style={{ margin: '0 auto', fontSize: '17px', color: '#888', maxWidth: '500px', lineHeight: 1.6 }}>
            Discover homes across Ontario&apos;s most popular markets — all powered by real-time MLS® data.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {CITIES.map((c, i) => (
            <Link key={c.name} href={`/buy?city=${encodeURIComponent(c.name)}`}
              style={{
                textDecoration: 'none', color: 'inherit',
                gridColumn: i < 2 ? 'span 2' : 'span 1',
              }}
            >
              <div style={{
                borderRadius: '20px', overflow: 'hidden',
                background: c.gradient,
                padding: '32px',
                minHeight: i < 2 ? '200px' : '160px',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                cursor: 'pointer', transition: 'all 0.3s',
                position: 'relative',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <span style={{
                  position: 'absolute', top: '16px', right: '16px',
                  fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)',
                  padding: '4px 10px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '100px',
                }}>
                  {c.listings} listings
                </span>
                <h3 style={{ margin: '0 0 4px', fontSize: i < 2 ? '28px' : '22px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
                  {c.name}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                  {c.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
