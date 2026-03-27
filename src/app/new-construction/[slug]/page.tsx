'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Project {
  slug: string;
  name: string;
  builder: string;
  city: string;
  province: string;
  price_from: number;
  property_type: string;
  status: string;
  description: string;
  features: string[];
  completion_year: number;
  total_units: number;
  color: string;
  photo_url?: string | null;
}

const FALLBACK_PROJECTS: Record<string, Project> = {
  'the-greenwich': { slug: 'the-greenwich', name: 'The Greenwich', builder: 'Tribute Communities', city: 'Toronto', province: 'ON', price_from: 599900, property_type: 'Condos & Townhomes', status: 'Now Selling', description: 'A stunning collection of premium condos and townhomes in the heart of Toronto by Tribute Communities. Featuring modern architecture, luxury finishes, and access to transit, parks, and world-class amenities. Starting from the low $600s.', features: ['Rooftop terrace', 'Gym & wellness centre', 'Underground parking', 'Concierge service', 'Steps to TTC'], completion_year: 2027, total_units: 320, color: '#2563eb', photo_url: null },
  'claridge-moon': { slug: 'claridge-moon', name: 'Claridge Moon', builder: 'Claridge Homes', city: 'Ottawa', province: 'ON', price_from: 349900, property_type: 'Condominiums', status: 'Pre-Construction', description: 'Ottawa\'s most anticipated condominium community by Claridge Homes. Located in the vibrant Centretown neighbourhood, Claridge Moon offers stunning river views, walkable urban living, and prices starting in the mid $300s.', features: ['River views', 'Fitness centre', 'Party room', 'Pet wash station', 'Bike storage'], completion_year: 2028, total_units: 240, color: '#7c3aed', photo_url: null },
  'oro-at-edge-towers': { slug: 'oro-at-edge-towers', name: 'Oro at Edge Towers', builder: 'Solmar Development', city: 'Mississauga', province: 'ON', price_from: 499900, property_type: 'High-Rise Condos', status: 'Now Selling', description: 'Rise above the ordinary at Oro, the crowning tower of Edge Towers in Mississauga\'s City Centre. With breathtaking views, resort-style amenities, and direct connection to Square One, this is GTA living at its finest.', features: ['50+ storey tower', 'Infinity pool', 'Co-working lounge', 'Connected to Square One', 'LRT access'], completion_year: 2027, total_units: 450, color: '#059669', photo_url: null },
  'upper-west-side': { slug: 'upper-west-side', name: 'Upper West Side', builder: 'Branthaven Homes', city: 'Oakville', province: 'ON', price_from: 899900, property_type: 'Detached & Towns', status: 'Coming Soon', description: 'An exclusive collection of detached homes and townhomes in prestigious Oakville by Branthaven Homes. Premium finishes, oversized lots, and a family-friendly neighbourhood close to top-rated schools and lakefront trails.', features: ['Heritage-inspired architecture', '2-car garages', 'Premium lot sizes', 'Near top schools', 'Trail access'], completion_year: 2026, total_units: 85, color: '#dc2626', photo_url: null },
};

export default function NewConstructionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState('');

  useEffect(() => {
    params.then(p => {
      setSlug(p.slug);
      // Set fallback immediately so the UI renders instantly
      if (FALLBACK_PROJECTS[p.slug]) {
        setProject(FALLBACK_PROJECTS[p.slug]);
      }
      fetch(`/api/new-construction?slug=${p.slug}`)
        .then(r => r.json())
        .then(d => {
          if (d.project) setProject(d.project);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '120px 24px' }}>
        <div style={{ height: '400px', borderRadius: '24px', background: '#f0f0f0', marginBottom: '32px' }} />
        <div style={{ height: '32px', width: '300px', borderRadius: '8px', background: '#f0f0f0', marginBottom: '16px' }} />
        <div style={{ height: '20px', width: '500px', borderRadius: '8px', background: '#f0f0f0' }} />
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '48px', marginBottom: '16px' }}>🏗️</p>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#111', marginBottom: '12px' }}>Project Not Found</h1>
        <p style={{ fontSize: '15px', color: '#888', marginBottom: '32px' }}>The new construction project &quot;{slug}&quot; could not be found.</p>
        <Link href="/new-construction" style={{ background: '#da291c', color: 'white', padding: '12px 24px', borderRadius: '100px', fontSize: '14px', fontWeight: 800, textDecoration: 'none' }}>
          View All Projects →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '120px 24px 80px' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#888' }}>
        <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
        <span>›</span>
        <Link href="/new-construction" style={{ color: '#888', textDecoration: 'none' }}>New Construction</Link>
        <span>›</span>
        <span style={{ color: '#111' }}>{project.name}</span>
      </div>

      {/* Hero */}
      <div style={{
        height: '360px', borderRadius: '24px', overflow: 'hidden',
        background: project.photo_url
          ? `url(${project.photo_url}) center/cover`
          : `linear-gradient(135deg, ${project.color} 0%, ${project.color}88 50%, ${project.color}33 100%)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '40px', position: 'relative', marginBottom: '40px',
      }}>
        <div style={{ fontSize: '80px', opacity: 0.15, position: 'absolute', top: '40px', right: '40px' }}>🏗️</div>
        <div style={{
          display: 'inline-flex', alignSelf: 'flex-start',
          padding: '6px 16px', borderRadius: '100px',
          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
          color: 'white', fontSize: '12px', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px',
        }}>
          {project.status}
        </div>
        <h1 style={{ margin: '0 0 4px', fontSize: '48px', fontWeight: 900, color: 'white', letterSpacing: '-2px' }}>
          {project.name}
        </h1>
        <p style={{ margin: 0, fontSize: '18px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
          by {project.builder} · {project.city}, {project.province}
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {[
          { label: 'Starting From', value: `$${project.price_from?.toLocaleString()}`, icon: '💰' },
          { label: 'Property Type', value: project.property_type, icon: '🏠' },
          { label: 'Est. Completion', value: project.completion_year?.toString(), icon: '📅' },
          { label: 'Total Units', value: project.total_units?.toString(), icon: '🏢' },
        ].map(s => (
          <div key={s.label} style={{
            padding: '20px', borderRadius: '16px',
            background: 'white', border: '1.5px solid #eee',
          }}>
            <span style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }}>{s.icon}</span>
            <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>About {project.name}</h2>
        <p style={{ margin: 0, fontSize: '16px', color: '#555', lineHeight: 1.8, fontWeight: 500 }}>
          {project.description}
        </p>
      </div>

      {/* Features */}
      {project.features && project.features.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>Key Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {project.features.map((f, i) => (
              <div key={i} style={{
                padding: '16px 20px', borderRadius: '12px',
                background: 'white', border: '1.5px solid #eee',
                fontSize: '14px', fontWeight: 700, color: '#333',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <span style={{ color: project.color, fontSize: '16px' }}>✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{
        padding: '40px', borderRadius: '20px',
        background: `linear-gradient(135deg, ${project.color} 0%, ${project.color}cc 100%)`,
        textAlign: 'center',
      }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '28px', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>
          Interested in {project.name}?
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: '16px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
          Get exclusive pricing, floor plans, and VIP access to this development.
        </p>
        <Link href="/sell" style={{
          display: 'inline-block', background: 'white', color: project.color,
          padding: '14px 32px', borderRadius: '100px',
          fontSize: '16px', fontWeight: 900, textDecoration: 'none',
          letterSpacing: '-0.5px',
        }}>
          Request Info →
        </Link>
      </div>
    </div>
  );
}
