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
  trust_score?: number | null;
}

// Wired-First Doctrine: No hardcoded fallback arrays. Data comes from core_logic or nothing.

export default function NewConstructionSpotlight() {
  const [projects, setProjects] = useState<Project[]>([]);
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
          {projects.length === 0 && !loading && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 24px', color: '#888', fontSize: '16px', fontWeight: 600 }}>
              No pre-construction projects loaded yet. The extraction fleet will populate this section.
            </div>
          )}
          {projects.slice(0, 4).map((p: Project) => (
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                        by {p.builder}
                      </p>
                      {p.trust_score && p.trust_score >= 90 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: 800, border: '1px solid rgba(16,185,129,0.2)', backdropFilter: 'blur(4px)' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                          BUILDER SCORE {p.trust_score}
                        </div>
                      )}
                    </div>
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
