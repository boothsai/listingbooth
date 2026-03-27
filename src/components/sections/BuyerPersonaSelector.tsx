'use client';

import Link from 'next/link';

const PERSONAS = [
  {
    id: 'first-time',
    icon: '🏠',
    title: 'First-Time Buyer',
    description: 'Starter homes, affordability tools, and step-by-step guidance to get your first keys.',
    cta: 'Find Starter Homes',
    href: '/buy?max_price=600000&type=Condo,Townhouse',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 'move-up',
    icon: '📈',
    title: 'Move-Up Buyer',
    description: 'More space, better schools, dream neighborhoods. Trade up with confidence.',
    cta: 'Upgrade Your Space',
    href: '/buy?min_price=600000&beds=4',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    id: 'investor',
    icon: '💰',
    title: 'Investor',
    description: 'Cash flow analysis, cap rates, and rental yield data on every listing.',
    cta: 'Find Cash Flow',
    href: '/buy?sort=price_asc&type=Condo',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    id: 'downsizer',
    icon: '🌿',
    title: 'Downsizer',
    description: 'Maintenance-free living, accessible layouts, and vibrant condo communities.',
    cta: 'Simplify Your Life',
    href: '/buy?type=Condo&beds=2',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
  {
    id: 'relocating',
    icon: '🧳',
    title: 'Relocating',
    description: 'Explore new cities, compare neighborhoods, and plan your move with AI insights.',
    cta: 'Explore New Cities',
    href: '/map-search',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
];

export default function BuyerPersonaSelector() {
  return (
    <section style={{ padding: '80px 24px', backgroundColor: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 800, color: '#da291c', letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center' }}>
          PERSONALIZED FOR YOU
        </p>
        <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, color: '#111', letterSpacing: '-2px', lineHeight: 1.1, textAlign: 'center' }}>
          What kind of buyer are you?
        </h2>
        <p style={{ margin: '0 auto 48px', fontSize: '17px', color: '#666', maxWidth: '600px', lineHeight: 1.6, textAlign: 'center' }}>
          Every buyer is different. Tell us your goal and we&apos;ll tailor the entire experience — listings, tools, and insights — just for you.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {PERSONAS.map(p => (
            <Link key={p.id} href={p.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div
                style={{
                  position: 'relative',
                  borderRadius: '20px',
                  padding: '32px 24px',
                  background: 'white',
                  border: '1.5px solid #eee',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden',
                  minHeight: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.12)';
                  e.currentTarget.style.borderColor = 'transparent';
                  const overlay = e.currentTarget.querySelector('[data-overlay]') as HTMLElement;
                  if (overlay) overlay.style.opacity = '1';
                  const txt = e.currentTarget.querySelector('[data-title]') as HTMLElement;
                  if (txt) txt.style.color = 'white';
                  const desc = e.currentTarget.querySelector('[data-desc]') as HTMLElement;
                  if (desc) desc.style.color = 'rgba(255,255,255,0.85)';
                  const cta = e.currentTarget.querySelector('[data-cta]') as HTMLElement;
                  if (cta) { cta.style.background = 'white'; cta.style.color = '#111'; }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#eee';
                  const overlay = e.currentTarget.querySelector('[data-overlay]') as HTMLElement;
                  if (overlay) overlay.style.opacity = '0';
                  const txt = e.currentTarget.querySelector('[data-title]') as HTMLElement;
                  if (txt) txt.style.color = '#111';
                  const desc = e.currentTarget.querySelector('[data-desc]') as HTMLElement;
                  if (desc) desc.style.color = '#666';
                  const cta = e.currentTarget.querySelector('[data-cta]') as HTMLElement;
                  if (cta) { cta.style.background = '#da291c'; cta.style.color = 'white'; }
                }}
              >
                {/* Gradient overlay on hover */}
                <div data-overlay="" style={{
                  position: 'absolute', inset: 0, background: p.gradient,
                  opacity: 0, transition: 'opacity 0.3s', borderRadius: '20px', zIndex: 0,
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '40px', marginBottom: '16px' }}>{p.icon}</div>
                  <h3 data-title="" style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px', transition: 'color 0.3s' }}>
                    {p.title}
                  </h3>
                  <p data-desc="" style={{ margin: '0 0 20px', fontSize: '14px', color: '#666', lineHeight: 1.5, transition: 'color 0.3s' }}>
                    {p.description}
                  </p>
                </div>
                <div data-cta="" style={{
                  position: 'relative', zIndex: 1,
                  display: 'inline-block', padding: '10px 20px', borderRadius: '100px',
                  background: '#da291c', color: 'white',
                  fontSize: '13px', fontWeight: 800, letterSpacing: '0.02em',
                  textAlign: 'center', transition: 'all 0.3s',
                }}>
                  {p.cta} →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
