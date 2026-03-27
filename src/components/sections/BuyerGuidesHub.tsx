'use client';

import Link from 'next/link';

const GUIDES = [
  {
    icon: '🏠',
    title: 'First-Time Buyer Guide',
    description: 'Everything you need to know about buying your first home in Ontario — from pre-approval to closing day.',
    bullets: ['Mortgage pre-approval checklist', 'First-time buyer incentives (FHSA, HBP)', 'Understanding closing costs'],
    href: '/buy?max_price=600000',
    color: '#667eea',
  },
  {
    icon: '📈',
    title: 'Move-Up Buyer Playbook',
    description: 'Ready to upgrade? Learn how to leverage your existing equity and time the market for maximum value.',
    bullets: ['Home equity calculator', 'Bridge financing explained', 'Neighborhood comparison tools'],
    href: '/buy?min_price=600000&beds=4',
    color: '#f5576c',
  },
  {
    icon: '💰',
    title: 'Real Estate Investor Toolkit',
    description: 'Data-driven analysis for smart investors — ROI projections, cap rates, and rental yield on every listing.',
    bullets: ['Cash flow calculator', 'Cap rate by neighborhood', 'Multi-unit property finder'],
    href: '/tools',
    color: '#4facfe',
  },
  {
    icon: '🌿',
    title: 'Downsizing Made Easy',
    description: 'Simplify your life without sacrificing comfort. Find low-maintenance condos and bungalows near the best amenities.',
    bullets: ['Accessibility features filter', 'Condo fee comparison', 'Walkability score rankings'],
    href: '/buy?type=Condo&beds=2',
    color: '#43e97b',
  },
  {
    icon: '🧳',
    title: 'Relocation Guide',
    description: 'Moving to a new city? Explore neighborhoods, school rankings, commute times, and community vibes before you arrive.',
    bullets: ['City-by-city comparison', 'School district rankings', 'Cost of living breakdown'],
    href: '/map-search',
    color: '#fa709a',
  },
];

export default function BuyerGuidesHub() {
  return (
    <section style={{ padding: '80px 24px', backgroundColor: '#fafafa' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 800, color: '#da291c', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            BUYER RESOURCES
          </p>
          <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, color: '#111', letterSpacing: '-2px', lineHeight: 1.1 }}>
            Guides Built for Your Journey
          </h2>
          <p style={{ margin: '0 auto', fontSize: '17px', color: '#666', maxWidth: '600px', lineHeight: 1.6 }}>
            Whether you&apos;re buying for the first time or building a portfolio, we have the tools and data to help you win.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {GUIDES.map(g => (
            <Link key={g.title} href={g.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                borderRadius: '20px', padding: '32px',
                background: 'white', border: '1.5px solid #eee',
                transition: 'all 0.3s', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', height: '100%',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: `${g.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', marginBottom: '20px',
                }}>
                  {g.icon}
                </div>

                <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>
                  {g.title}
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#666', lineHeight: 1.6, flex: 1 }}>
                  {g.description}
                </p>

                <ul style={{ margin: '0 0 20px', padding: 0, listStyle: 'none' }}>
                  {g.bullets.map(b => (
                    <li key={b} style={{ fontSize: '13px', color: '#555', fontWeight: 600, padding: '4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: g.color, fontSize: '10px' }}>●</span> {b}
                    </li>
                  ))}
                </ul>

                <span style={{ fontSize: '14px', fontWeight: 800, color: '#da291c' }}>
                  Explore Guide →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
