'use client';

import Link from 'next/link';

const PROJECTS = [
  {
    name: 'The Greenwich',
    builder: 'Tribute Communities',
    city: 'Toronto',
    priceRange: 'From $599,900',
    type: 'Condos & Townhomes',
    status: 'Now Selling',
    color: '#2563eb',
  },
  {
    name: 'Claridge Moon',
    builder: 'Claridge Homes',
    city: 'Ottawa',
    priceRange: 'From $349,900',
    type: 'Condominiums',
    status: 'Pre-Construction',
    color: '#7c3aed',
  },
  {
    name: 'Oro at Edge Towers',
    builder: 'Solmar Development',
    city: 'Mississauga',
    priceRange: 'From $499,900',
    type: 'High-Rise Condos',
    status: 'Now Selling',
    color: '#059669',
  },
  {
    name: 'Upper West Side',
    builder: 'Branthaven Homes',
    city: 'Oakville',
    priceRange: 'From $899,900',
    type: 'Detached & Towns',
    status: 'Coming Soon',
    color: '#dc2626',
  },
];

export default function NewConstructionSpotlight() {
  return (
    <section style={{ padding: '80px 24px', backgroundColor: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 800, color: '#da291c', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              NEW CONSTRUCTION
            </p>
            <h2 style={{ margin: 0, fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, color: '#111', letterSpacing: '-2px', lineHeight: 1.1 }}>
              Now Selling in Ontario
            </h2>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#888', padding: '6px 14px', border: '1.5px solid #eee', borderRadius: '100px' }}>
            🏗️ Phase 1: Ottawa + Toronto
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {PROJECTS.map(p => (
            <Link key={p.name} href="/buy" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                borderRadius: '20px', overflow: 'hidden',
                border: '1.5px solid #eee', background: 'white',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Gradient hero block */}
                <div style={{
                  height: '180px',
                  background: `linear-gradient(135deg, ${p.color} 0%, ${p.color}99 50%, ${p.color}44 100%)`,
                  padding: '24px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  position: 'relative',
                }}>
                  {/* Status pill */}
                  <div style={{
                    display: 'inline-flex', alignSelf: 'flex-start',
                    padding: '4px 12px', borderRadius: '100px',
                    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                    color: 'white', fontSize: '11px', fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    {p.status}
                  </div>
                  {/* Building icon */}
                  <div style={{ fontSize: '48px', opacity: 0.3, position: 'absolute', bottom: '16px', right: '20px' }}>🏗️</div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
                      {p.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                      by {p.builder}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>
                      {p.priceRange}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#555', padding: '4px 10px', background: '#f5f5f5', borderRadius: '100px' }}>
                      📍 {p.city}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#555', padding: '4px 10px', background: '#f5f5f5', borderRadius: '100px' }}>
                      {p.type}
                    </span>
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
