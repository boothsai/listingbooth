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

export default function NewConstructionSpotlight() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/new-construction?limit=4')
      .then(r => r.json())
      .then(d => setProjects(d.projects ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section style={{ padding: '80px 24px', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: '300px', borderRadius: '20px', background: '#f0f0f0' }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) return null;

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
          <Link href="/new-construction" style={{ fontSize: '14px', fontWeight: 800, color: '#da291c', textDecoration: 'none' }}>
            View All Projects →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {projects.slice(0, 4).map(p => (
            <Link key={p.slug} href={`/new-construction/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                borderRadius: '20px', overflow: 'hidden',
                border: '1.5px solid #eee', background: 'white',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Gradient hero block or photo */}
                <div style={{
                  height: '180px',
                  background: p.photo_url
                    ? `url(${p.photo_url}) center/cover`
                    : `linear-gradient(135deg, ${p.color} 0%, ${p.color}99 50%, ${p.color}44 100%)`,
                  padding: '24px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  position: 'relative',
                }}>
                  <div style={{
                    display: 'inline-flex', alignSelf: 'flex-start',
                    padding: '4px 12px', borderRadius: '100px',
                    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                    color: 'white', fontSize: '11px', fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    {p.status}
                  </div>
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
                      From ${p.price_from?.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#555', padding: '4px 10px', background: '#f5f5f5', borderRadius: '100px' }}>
                      📍 {p.city}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#555', padding: '4px 10px', background: '#f5f5f5', borderRadius: '100px' }}>
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
