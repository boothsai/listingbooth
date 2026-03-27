'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Project {
  slug: string;
  name: string;
  builder: string;
  city: string;
  price_from: number;
  property_type: string;
  status: string;
  color: string;
  photo_url?: string | null;
}

const FALLBACK_PROJECTS: Project[] = [
  { slug: 'the-greenwich', name: 'The Greenwich', builder: 'Tribute Communities', city: 'Toronto', price_from: 599900, property_type: 'Condos & Townhomes', status: 'Now Selling', color: '#2563eb', photo_url: null },
  { slug: 'claridge-moon', name: 'Claridge Moon', builder: 'Claridge Homes', city: 'Ottawa', price_from: 349900, property_type: 'Condominiums', status: 'Pre-Construction', color: '#7c3aed', photo_url: null },
  { slug: 'oro-at-edge-towers', name: 'Oro at Edge Towers', builder: 'Solmar Development', city: 'Mississauga', price_from: 499900, property_type: 'High-Rise Condos', status: 'Now Selling', color: '#059669', photo_url: null },
  { slug: 'upper-west-side', name: 'Upper West Side', builder: 'Branthaven Homes', city: 'Oakville', price_from: 899900, property_type: 'Detached & Towns', status: 'Coming Soon', color: '#dc2626', photo_url: null },
];

export default function NewConstructionSpotlight() {
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/new-construction?limit=4')
      .then(r => r.json())
      .then(d => {
        const fetched = d.projects ?? [];
        if (fetched.length > 0) setProjects(fetched);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section style={{ padding: '120px 5%', backgroundColor: '#fff' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '64px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ 
              display: 'inline-flex', padding: '6px 12px', borderRadius: '4px', 
              background: 'rgba(218,41,28,0.05)', color: '#da291c', fontWeight: 800, 
              fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px'
            }}>
              New Construction
            </div>
            <h2 style={{ margin: 0, fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: '#111', letterSpacing: '-0.04em', lineHeight: 1.05 }}>
              Now Selling in Ontario
            </h2>
          </div>
          <Link href="/new-construction" style={{ 
            padding: '14px 32px', background: '#111', color: 'white', 
            borderRadius: '100px', fontSize: '15px', fontWeight: 800, textDecoration: 'none',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#da291c'}
          onMouseLeave={e => e.currentTarget.style.background = '#111'}
          >
            View All Projects →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {(loading ? FALLBACK_PROJECTS : projects).slice(0, 4).map(p => (
            <Link key={p.slug} href={`/new-construction/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                borderRadius: '24px', overflow: 'hidden',
                border: '1px solid #eee', background: 'white',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 24px 48px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Gradient hero block or photo */}
                <div style={{
                  height: '200px',
                  background: p.photo_url
                    ? `url(${p.photo_url}) center/cover`
                    : `linear-gradient(135deg, ${p.color} 0%, ${p.color}99 50%, ${p.color}44 100%)`,
                  padding: '24px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  position: 'relative',
                }}>
                  <div style={{
                    display: 'inline-flex', alignSelf: 'flex-start',
                    padding: '6px 14px', borderRadius: '100px',
                    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                    color: 'white', fontSize: '11px', fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    {p.status}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
                      {p.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                      by {p.builder}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: '24px' }}>
                  <p style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>
                    From ${p.price_from?.toLocaleString()}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#555', padding: '6px 12px', background: '#f5f5f5', borderRadius: '100px' }}>
                      📍 {p.city}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#555', padding: '6px 12px', background: '#f5f5f5', borderRadius: '100px' }}>
                      {p.property_type}
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
