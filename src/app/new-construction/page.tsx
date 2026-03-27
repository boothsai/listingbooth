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
  description: string;
  total_units: number;
  completion_year: number;
  photo_url?: string | null;
}

const STATUS_FILTERS = ['All', 'Now Selling', 'Pre-Construction', 'Coming Soon'];
const CITY_FILTERS = ['All', 'Toronto', 'Ottawa', 'Mississauga', 'Oakville', 'Hamilton', 'Vaughan'];

const FALLBACK: Project[] = [
  { slug: 'the-greenwich', name: 'The Greenwich', builder: 'Tribute Communities', city: 'Toronto', price_from: 599900, property_type: 'Condos & Townhomes', status: 'Now Selling', color: '#2563eb', description: 'A stunning collection of premium condos and townhomes in the heart of Toronto by Tribute Communities.', total_units: 320, completion_year: 2027 },
  { slug: 'claridge-moon', name: 'Claridge Moon', builder: 'Claridge Homes', city: 'Ottawa', price_from: 349900, property_type: 'Condominiums', status: 'Pre-Construction', color: '#7c3aed', description: 'Ottawa\'s most anticipated condominium community by Claridge Homes in vibrant Centretown.', total_units: 240, completion_year: 2028 },
  { slug: 'oro-at-edge-towers', name: 'Oro at Edge Towers', builder: 'Solmar Development', city: 'Mississauga', price_from: 499900, property_type: 'High-Rise Condos', status: 'Now Selling', color: '#059669', description: 'Rise above the ordinary at Oro, the crowning tower of Edge Towers in Mississauga\'s City Centre.', total_units: 450, completion_year: 2027 },
  { slug: 'upper-west-side', name: 'Upper West Side', builder: 'Branthaven Homes', city: 'Oakville', price_from: 899900, property_type: 'Detached & Towns', status: 'Coming Soon', color: '#dc2626', description: 'An exclusive collection of detached homes and townhomes in prestigious Oakville.', total_units: 85, completion_year: 2026 },
];

export default function NewConstructionListPage() {
  const [projects, setProjects] = useState<Project[]>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');

  useEffect(() => {
    fetch('/api/new-construction')
      .then(r => r.json())
      .then(d => {
        const fetched = d.projects ?? [];
        if (fetched.length > 0) setProjects(fetched);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p => {
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (cityFilter !== 'All' && p.city !== cityFilter) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#888' }}>
          <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <span style={{ color: '#111' }}>New Construction</span>
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: '#111', letterSpacing: '-2px', lineHeight: 1.1 }}>
          New Construction
        </h1>
        <p style={{ margin: 0, fontSize: '18px', color: '#888', fontWeight: 500 }}>
          Pre-construction and new build communities across Ontario. Get VIP access to exclusive pricing and floor plans.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'white', borderRadius: '12px', border: '1.5px solid #eee' }}>
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: statusFilter === s ? '#111' : 'transparent',
              color: statusFilter === s ? 'white' : '#666',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              {s}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'white', borderRadius: '12px', border: '1.5px solid #eee' }}>
          {CITY_FILTERS.map(c => (
            <button key={c} onClick={() => setCityFilter(c)} style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: cityFilter === c ? '#111' : 'transparent',
              color: cityFilter === c ? 'white' : '#666',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              {c}
            </button>
          ))}
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#888' }}>
          {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: '360px', borderRadius: '20px', background: '#f0f0f0' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '20px', border: '1.5px solid #eee' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>🏗️</p>
          <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 900, color: '#111' }}>No projects match your filters</h3>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#666' }}>Try adjusting your status or city filters.</p>
          <button onClick={() => { setStatusFilter('All'); setCityFilter('All'); }} style={{
            background: '#da291c', color: 'white', padding: '12px 24px',
            borderRadius: '100px', fontSize: '14px', fontWeight: 800,
            border: 'none', cursor: 'pointer',
          }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {filtered.map(p => (
            <Link key={p.slug} href={`/new-construction/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                borderRadius: '20px', overflow: 'hidden',
                border: '1.5px solid #eee', background: 'white',
                transition: 'all 0.3s', cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{
                  height: '200px',
                  background: p.photo_url
                    ? `url(${p.photo_url}) center/cover`
                    : `linear-gradient(135deg, ${p.color} 0%, ${p.color}88 50%, ${p.color}33 100%)`,
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
                  <div style={{ fontSize: '48px', opacity: 0.2, position: 'absolute', bottom: '16px', right: '20px' }}>🏗️</div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
                      {p.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                      by {p.builder}
                    </p>
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <p style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>
                    From ${p.price_from?.toLocaleString()}
                  </p>
                  <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#666', lineHeight: 1.5, fontWeight: 500 }}>
                    {p.description?.slice(0, 120)}...
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#555', padding: '4px 10px', background: '#f5f5f5', borderRadius: '100px' }}>
                      📍 {p.city}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#555', padding: '4px 10px', background: '#f5f5f5', borderRadius: '100px' }}>
                      {p.property_type}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#555', padding: '4px 10px', background: '#f5f5f5', borderRadius: '100px' }}>
                      🏢 {p.total_units} units
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
