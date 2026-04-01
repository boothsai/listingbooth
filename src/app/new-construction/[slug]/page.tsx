'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(m => m.Circle), { ssr: false });

// Fix: Leaflet tiles don't render when map initializes off-screen
const MapResizer = dynamic(() => Promise.resolve(function MapResizerInner() {
  const { useMap } = require('react-leaflet');
  const { useEffect } = require('react');
  const map = useMap();
  useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize(), 300);
    const t2 = setTimeout(() => map.invalidateSize(), 800);
    const t3 = setTimeout(() => map.invalidateSize(), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [map]);
  return null;
}), { ssr: false });

interface Product {
  model_name: string;
  home_type: string;
  beds: number;
  baths: number;
  sqft: number;
  price_from: number;
}

interface Project {
  slug: string;
  name: string;
  builder: string;
  builder_website?: string | null;
  city: string;
  province?: string;
  price_from: number;
  property_type: string;
  status: string;
  description: string;
  features?: string[];
  completion_year: number;
  total_units: number;
  color: string;
  photo_url?: string | null;
  trust_score?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  products?: Product[];
}

const FALLBACK_PROJECTS: Record<string, Project> = {
  'the-greenwich': { slug: 'the-greenwich', name: 'The Greenwich', builder: 'Tribute Communities', city: 'Toronto', province: 'ON', price_from: 599900, property_type: 'Condos & Townhomes', status: 'Now Selling', description: 'A stunning collection of premium condos and townhomes in the heart of Toronto by Tribute Communities. Featuring modern architecture, luxury finishes, and access to transit, parks, and world-class amenities. Starting from the low $600s.', features: ['Rooftop terrace', 'Gym & wellness centre', 'Underground parking', 'Concierge service', 'Steps to TTC'], completion_year: 2027, total_units: 320, color: '#2563eb', photo_url: null },
  'claridge-moon': { slug: 'claridge-moon', name: 'Claridge Moon', builder: 'Claridge Homes', city: 'Ottawa', province: 'ON', price_from: 349900, property_type: 'Condominiums', status: 'Pre-Construction', description: 'Ottawa\'s most anticipated condominium community by Claridge Homes. Located in the vibrant Centretown neighbourhood, Claridge Moon offers stunning river views, walkable urban living, and prices starting in the mid $300s.', features: ['River views', 'Fitness centre', 'Party room', 'Pet wash station', 'Bike storage'], completion_year: 2028, total_units: 240, color: '#7c3aed', photo_url: null },
  'oro-at-edge-towers': { slug: 'oro-at-edge-towers', name: 'Oro at Edge Towers', builder: 'Solmar Development', city: 'Mississauga', province: 'ON', price_from: 499900, property_type: 'High-Rise Condos', status: 'Now Selling', description: 'Rise above the ordinary at Oro, the crowning tower of Edge Towers in Mississauga\'s City Centre. With breathtaking views, resort-style amenities, and direct connection to Square One, this is GTA living at its finest.', features: ['50+ storey tower', 'Infinity pool', 'Co-working lounge', 'Connected to Square One', 'LRT access'], completion_year: 2027, total_units: 450, color: '#059669', photo_url: null },
  'upper-west-side': { slug: 'upper-west-side', name: 'Upper West Side', builder: 'Branthaven Homes', city: 'Oakville', province: 'ON', price_from: 899900, property_type: 'Detached & Towns', status: 'Coming Soon', description: 'An exclusive collection of detached homes and townhomes in prestigious Oakville by Branthaven Homes. Premium finishes, oversized lots, and a family-friendly neighbourhood close to top-rated schools and lakefront trails.', features: ['Heritage-inspired architecture', '2-car garages', 'Premium lot sizes', 'Near top schools', 'Trail access'], completion_year: 2026, total_units: 85, color: '#dc2626', photo_url: null },
};

export default function NewConstructionDetailPage({ params }: { params: { slug: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [similar, setSimilar] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState('');
  const [mapReady, setMapReady] = useState(false);
  
  // Paywall State
  const [unlocked, setUnlocked] = useState(false);
  const [freebiesLeft, setFreebiesLeft] = useState<number | null>(null);
  
  // Lead Capture State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isRealtor, setIsRealtor] = useState(false);

  // Active Listings Layer
  const [nearbyListings, setNearbyListings] = useState<any[]>([]);
  const [showListings, setShowListings] = useState(true);

  // Isochrone Layer
  const [showIsochrone, setShowIsochrone] = useState(true);

  // HCRA Live Verification State
  const [hcraData, setHcraData] = useState<any>(null);
  const [verifyingHcra, setVerifyingHcra] = useState(false);

  useEffect(() => {
    Promise.resolve(params).then(p => {
      setSlug(p.slug);

      // Metered Paywall Engine (2 Freebies)
      const isGlobalUnlocked = localStorage.getItem('vip_unlocked') === 'true';
      if (isGlobalUnlocked) {
        setUnlocked(true);
      } else {
        let viewed = JSON.parse(localStorage.getItem('viewed_projects') || '[]');
        if (!viewed.includes(p.slug)) {
          viewed.push(p.slug);
          localStorage.setItem('viewed_projects', JSON.stringify(viewed));
        }
        
        if (viewed.length <= 2) {
          setUnlocked(true);
          setFreebiesLeft(3 - viewed.length);
        } else {
          setUnlocked(false);
          setFreebiesLeft(0);
        }
      }
      // Set fallback immediately so the UI renders instantly
      if (FALLBACK_PROJECTS[p.slug]) {
        setProject(FALLBACK_PROJECTS[p.slug]);
      }
      fetch(`/api/new-construction?slug=${p.slug}`)
        .then(r => r.json())
        .then(d => {
          if (d.project) {
            setProject(d.project);
            
            // Trigger HCRA/Tarion Live Verification
            if (d.project.builder) {
              setVerifyingHcra(true);
              fetch(`/api/builder/verify?name=${encodeURIComponent(d.project.builder)}`)
                .then(res => res.json())
                .then(hcra => {
                  if (hcra.data) setHcraData(hcra.data);
                })
                .catch(() => {})
                .finally(() => setVerifyingHcra(false));
            }

            // Fetch nearby resale listings within ~5km radius
            if (d.project.latitude && d.project.longitude) {
              const R = 0.045; // ~5km in degrees
              fetch('/api/listings/bounds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  minLat: d.project.latitude - R,
                  maxLat: d.project.latitude + R,
                  minLng: d.project.longitude - R,
                  maxLng: d.project.longitude + R,
                }),
              }).then(r => r.json()).then(r => {
                if (r.results) setNearbyListings(r.results.slice(0, 50));
              }).catch(() => {});
            }
          }
          if (d.similar) setSimilar(d.similar);
        })
        .catch(() => {})
        .finally(() => {
          setLoading(false);
          setTimeout(() => setMapReady(true), 300);
        });
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

  const builderScore = project.trust_score || 0;
  const scoreColor = builderScore >= 90 ? '#10b981' : builderScore >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '120px 24px 80px' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#888' }}>
        <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
        <span>›</span>
        <Link href="/new-construction" style={{ color: '#888', textDecoration: 'none' }}>New Construction</Link>
        <span>›</span>
        <Link href={`/new-construction/city/${project.city?.toLowerCase()}`} style={{ color: '#888', textDecoration: 'none' }}>{project.city}</Link>
        <span>›</span>
        <span style={{ color: '#111' }}>{project.name}</span>
      </div>

      {/* Freebie Meter Notification */}
      {freebiesLeft !== null && freebiesLeft > 0 && unlocked && (
        <div style={{ position: 'fixed', top: '100px', right: '24px', zIndex: 1000, background: 'rgba(17,17,17,0.9)', backdropFilter: 'blur(12px)', color: 'white', padding: '12px 20px', borderRadius: '16px', border: '1px solid #10b981', boxShadow: '0 8px 32px rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#10b981', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#111' }}>{freebiesLeft}</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.05em' }}>VIP Freebie Mode</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#ccc' }}>Free views remaining before signup.</div>
          </div>
        </div>
      )}

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <p style={{ margin: 0, fontSize: '18px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
            by {project.builder} · {project.city}{project.province ? `, ${project.province}` : ''}
          </p>
          {project.trust_score && project.trust_score >= 90 && (
            <Link href="/builder-score" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 800, border: '1px solid rgba(16,185,129,0.3)', backdropFilter: 'blur(8px)', textDecoration: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
              BUILDER SCORE {project.trust_score}
            </Link>
          )}
        </div>
      </div>

      {/* 🔐 PAYWALL CONTAINER */}
      <div style={{ position: 'relative' }}>
        
        {/* The Paywall Overlay */}
        {!unlocked && (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            zIndex: 100, display: 'flex', justifyContent: 'center', paddingTop: '80px',
            pointerEvents: 'auto'
          }}>
            <div style={{
              background: '#111', width: '100%', maxWidth: '440px', padding: '40px',
              borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 0 100vw rgba(0,0,0,0.2)', color: 'white', textAlign: 'center',
              height: 'fit-content'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
              <h3 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.5px' }}>Unlock VIP Access</h3>
              <p style={{ fontSize: '15px', color: '#aaa', marginBottom: '28px', lineHeight: 1.6 }}>
                You have exhausted your free project views. Create your free account to instantly reveal structural pricing, exact unit sizes, and exclusive VIP developer incentives.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', textAlign: 'left' }}>
                <input type="text" placeholder="Full Name*" value={name} onChange={e => setName(e.target.value)}
                  style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '15px', outline: 'none' }} />
                <input type="email" placeholder="Email Address*" value={email} onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '15px', outline: 'none' }} />
                <input type="tel" placeholder="Phone Number (Optional)" value={phone} onChange={e => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '15px', outline: 'none' }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#aaa', marginTop: '8px', padding: '0 8px' }}>
                  <input type="checkbox" checked={isRealtor} onChange={e => setIsRealtor(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: project.color || '#10b981' }} />
                  I am a licensed Real Estate Agent
                </label>
              </div>

              <button 
                onClick={async () => {
                  if (!email || !name) { alert("Please enter Name and Email to unlock."); return; }
                  // Fire lead to CRM pipeline
                  try {
                    await fetch('/api/leads', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name,
                        email,
                        phone: phone || null,
                        lead_type: isRealtor ? 'VIP Realtor — New Construction' : 'VIP Buyer — New Construction',
                        listing_key: project.slug,
                        address: `${project.name} by ${project.builder}`,
                        expo_push_token: typeof window !== 'undefined' ? (window as any).__EXPO_PUSH_TOKEN__ || null : null,
                        price: project.price_from || 0,
                        message: `VIP unlock for ${project.name} in ${project.city}. Realtor: ${isRealtor ? 'Yes' : 'No'}.`,
                      }),
                    });
                  } catch { /* non-blocking */ }
                  setUnlocked(true);
                  setFreebiesLeft(null);
                  localStorage.setItem('vip_unlocked', 'true');
                }}
                style={{ width: '100%', background: project.color || '#111', color: 'white', padding: '18px', borderRadius: '12px', fontSize: '15px', fontWeight: 900, border: 'none', cursor: 'pointer', transition: 'transform 0.2s', letterSpacing: '-0.5px' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                Reveal VIP Project Data
              </button>
            </div>
          </div>
        )}

        {/* SEO-Safe Blurred Content Container */}
        <div style={{
          filter: !unlocked ? 'blur(16px)' : 'none',
          opacity: !unlocked ? 0.2 : 1,
          pointerEvents: !unlocked ? 'none' : 'auto',
          userSelect: !unlocked ? 'none' : 'auto',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>

          {/* ═══════════════════════════════════════════════════════
              SECTION 1: Key Stats Grid (6 metrics)
          ═══════════════════════════════════════════════════════ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            {[
              { label: 'Starting From', value: project.price_from ? `$${project.price_from.toLocaleString()}` : 'TBD', icon: '💰' },
              { label: 'Property Type', value: project.property_type, icon: '🏠' },
              { label: 'Est. Completion', value: project.completion_year?.toString(), icon: '📅' },
              { label: 'Total Models', value: (project.products?.length || project.total_units || 0).toString(), icon: '🏢' },
              { label: 'Builder Score', value: builderScore ? `${builderScore}/100` : 'N/A', icon: '🛡️' },
              { label: 'City', value: project.city, icon: '📍' },
            ].map(s => (
              <div key={s.label} style={{
                padding: '20px', borderRadius: '16px',
                background: 'white', border: '1.5px solid #eee',
              }}>
                <span style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }}>{s.icon}</span>
                <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* ═══════════════════════════════════════════════════════
              SECTION 2: About the Community
          ═══════════════════════════════════════════════════════ */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>About {project.name}</h2>
            <p style={{ margin: 0, fontSize: '16px', color: '#555', lineHeight: 1.8, fontWeight: 500 }}>
              {project.description}
            </p>
          </div>

          {/* ═══════════════════════════════════════════════════════
              SECTION 3: Available Unit Types Table
          ═══════════════════════════════════════════════════════ */}
          {project.products && project.products.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>Available Unit Types</h2>
              <div style={{ borderRadius: '16px', border: '1.5px solid #eee', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f7f7f7' }}>
                      <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 800, color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Model</th>
                      <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 800, color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Type</th>
                      <th style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 800, color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Beds</th>
                      <th style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 800, color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Baths</th>
                      <th style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 800, color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sq Ft</th>
                      <th style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 800, color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>From</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.products.map((p, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #eee' }}>
                        <td style={{ padding: '14px 20px', fontWeight: 700, color: '#111' }}>{p.model_name || '—'}</td>
                        <td style={{ padding: '14px 20px', color: '#555' }}>{p.home_type || '—'}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 700 }}>{p.beds || '—'}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 700 }}>{p.baths || '—'}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'right', color: '#555' }}>{p.sqft ? `${p.sqft.toLocaleString()} sf` : '—'}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 900, color: '#111' }}>{p.price_from ? `$${p.price_from.toLocaleString()}` : 'TBD'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              SECTION 4: Builder Profile Card
          ═══════════════════════════════════════════════════════ */}
          <div style={{ marginBottom: '40px', padding: '32px', borderRadius: '20px', background: '#fafafa', border: '1.5px solid #eee' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '24px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>About the Builder</h2>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: `linear-gradient(135deg, ${project.color} 0%, ${project.color}88 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: 'white', fontWeight: 900, flexShrink: 0 }}>
                {project.builder?.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px' }}>{project.builder}</h3>
                <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#888', fontWeight: 600 }}>Licensed Ontario Builder · Active in {project.city}</p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <div style={{ padding: '8px 16px', borderRadius: '12px', background: 'white', border: '1.5px solid #eee' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Builder Score</span>
                    <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 900, color: scoreColor }}>{builderScore}/100</p>
                  </div>
                  
                  {verifyingHcra ? (
                    <div style={{ padding: '8px 16px', borderRadius: '12px', background: 'white', border: '1.5px solid #eee', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Connecting to Registry...</span>
                        <p style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: 800, color: '#111' }}>Verifying HCRA/Tarion Data</p>
                      </div>
                    </div>
                  ) : hcraData ? (
                    <>
                      <div style={{ padding: '8px 16px', borderRadius: '12px', background: 'white', border: '1.5px solid #eee' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>HCRA License</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0 0' }}>
                          <span style={{ fontSize: '24px', fontWeight: 900, color: hcraData.status === 'Licensed' ? '#10b981' : '#ef4444' }}>{hcraData.status}</span>
                          <span style={{ fontSize: '11px', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, color: '#888' }}>{hcraData.license_number}</span>
                        </div>
                      </div>
                      <div style={{ padding: '8px 16px', borderRadius: '12px', background: 'white', border: '1.5px solid #eee' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Homes Built</span>
                        <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 900, color: '#111' }}>{hcraData.homes_built.toLocaleString()}</p>
                      </div>
                      <div style={{ padding: '8px 16px', borderRadius: '12px', background: 'white', border: '1.5px solid #eee' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Claims</span>
                        <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 900, color: hcraData.chargeable_conciliations === 0 ? '#10b981' : '#f59e0b' }}>
                          {hcraData.chargeable_conciliations}
                        </p>
                      </div>
                    </>
                  ) : null}
                </div>
                {project.builder_website && (
                  <a href={project.builder_website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', fontWeight: 700, color: project.color || '#da291c', textDecoration: 'none' }}>
                    Visit Builder Website →
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              SECTION 5: Features Grid
          ═══════════════════════════════════════════════════════ */}
          {project.features && project.features.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>Key VIP Features</h2>
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

          {/* ═══════════════════════════════════════════════════════
              SECTION 6: Nearby Developments Map
          ═══════════════════════════════════════════════════════ */}
          {project.latitude && project.longitude && mapReady && (
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>Nearby Developments Map</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setShowIsochrone(!showIsochrone)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 16px', borderRadius: '100px',
                      background: showIsochrone ? '#3b82f6' : '#f5f5f5',
                      color: showIsochrone ? 'white' : '#888',
                      border: showIsochrone ? 'none' : '1.5px solid #eee',
                      fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
                    {showIsochrone ? '15-Min Walk Zone Active' : 'Show 15-Min Walk Zone'}
                  </button>
                  <button
                    onClick={() => setShowListings(!showListings)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 16px', borderRadius: '100px',
                      background: showListings ? '#0d9488' : '#f5f5f5',
                      color: showListings ? 'white' : '#888',
                      border: showListings ? 'none' : '1.5px solid #eee',
                      fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    {showListings ? `Active Listings (${nearbyListings.length})` : 'Show Active Listings'}
                  </button>
                </div>
              </div>
              <div style={{ height: '420px', borderRadius: '20px', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)' }}>
                <MapContainer
                  center={[project.latitude, project.longitude]}
                  zoom={11}
                  style={{ height: '100%', width: '100%', background: '#f8f8f8' }}
                  scrollWheelZoom={false}
                  attributionControl={false}
                  zoomControl={false}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  <MapResizer />
                  {/* 15-Minute Walk Isochrone (approx 1200m radius) */}
                  {showIsochrone && (
                    <Circle center={[project.latitude, project.longitude]} radius={1200} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 2, dashArray: '4 8' }} />
                  )}
                  {/* Current Project — Red branded pin with building icon */}
                  <Marker position={[project.latitude, project.longitude]}
                    icon={(() => { try { const L = require('leaflet'); return L.divIcon({ className: '', html: `<div style="display:flex;align-items:center;gap:6px;background:#da291c;color:white;padding:8px 14px;border-radius:12px;font-size:13px;font-weight:800;white-space:nowrap;box-shadow:0 4px 20px rgba(218,41,28,0.4);letter-spacing:-0.3px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M9 21V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v15"/><path d="M5 21V12a1 1 0 0 1 1-1h2"/><path d="M19 21V12a1 1 0 0 0-1-1h-2"/></svg>${project.name}</div>`, iconSize: [0, 0], iconAnchor: [80, 20] }); } catch { return undefined; } })()}
                  >
                    <Popup>
                      <div style={{ padding: '12px', fontSize: '14px' }}>
                        <div style={{ fontWeight: 900, marginBottom: '4px' }}>📍 {project.name}</div>
                        <div style={{ color: '#555', marginBottom: '8px' }}>by {project.builder} · {project.city}</div>
                        <div style={{ fontWeight: 900, color: '#da291c' }}>{project.price_from ? `From $${project.price_from.toLocaleString()}` : 'Pricing TBD'}</div>
                      </div>
                    </Popup>
                  </Marker>
                  {/* Nearby Projects — White pins with building icon + name + builder */}
                  {similar.filter(s => s.latitude && s.longitude).map(s => (
                    <Marker key={s.slug} position={[s.latitude!, s.longitude!]}
                      icon={(() => { try { const L = require('leaflet'); return L.divIcon({ className: '', html: `<div style="display:flex;align-items:center;gap:6px;background:white;color:#111;padding:7px 12px;border-radius:12px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 16px rgba(0,0,0,0.12);border:1px solid rgba(0,0,0,0.06)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#da291c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M9 21V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v15"/><path d="M5 21V12a1 1 0 0 1 1-1h2"/><path d="M19 21V12a1 1 0 0 0-1-1h-2"/></svg><div><div style="font-weight:800;letter-spacing:-0.3px">${s.name}</div><div style="font-size:10px;color:#888;font-weight:600">${s.builder}</div></div></div>`, iconSize: [0, 0], iconAnchor: [60, 20] }); } catch { return undefined; } })()}
                    >
                      <Popup>
                        <div style={{ padding: '12px', fontSize: '14px' }}>
                          <div style={{ fontWeight: 900, marginBottom: '4px' }}>{s.name}</div>
                          <div style={{ color: '#555', marginBottom: '4px' }}>by {s.builder}</div>
                          {s.trust_score && s.trust_score >= 90 && (
                            <div style={{ color: '#10b981', fontWeight: 800, fontSize: '12px', marginBottom: '4px' }}>Builder Score {s.trust_score}/100</div>
                          )}
                          <div style={{ fontWeight: 900 }}>{s.price_from ? `From $${s.price_from.toLocaleString()}` : 'Pricing TBD'}</div>
                          <a href={`/new-construction/${s.slug}`} style={{ display: 'inline-block', marginTop: '8px', color: '#da291c', fontWeight: 700, fontSize: '13px' }}>View Project →</a>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  {/* Active Resale Listings — teal house markers */}
                  {showListings && nearbyListings.map((l, i) => (
                    l.latitude && l.longitude && (
                      <Marker key={`resale-${i}`} position={[l.latitude, l.longitude]}
                        icon={(() => { try { const L = require('leaflet'); const price = l.list_price >= 1000000 ? `$${(l.list_price/1000000).toFixed(1)}M` : `$${Math.round(l.list_price/1000)}k`; return L.divIcon({ className: '', html: `<div style="display:flex;align-items:center;gap:4px;background:#0d9488;color:white;padding:4px 10px;border-radius:100px;font-size:11px;font-weight:800;white-space:nowrap;box-shadow:0 2px 10px rgba(13,148,136,0.3);letter-spacing:-0.3px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>${price}</div>`, iconSize: [0, 0], iconAnchor: [40, 12] }); } catch { return undefined; } })()}
                      >
                        <Popup>
                          <div style={{ padding: '12px', fontSize: '14px' }}>
                            <div style={{ fontWeight: 900, marginBottom: '4px' }}>{l.address_street}</div>
                            <div style={{ color: '#555', marginBottom: '4px' }}>{l.property_type} · {l.bedrooms_total}bd/{l.bathrooms_total}ba</div>
                            <div style={{ fontWeight: 900, color: '#0d9488' }}>${l.list_price?.toLocaleString()}</div>
                            <a href={`/listing/${l.listing_key}`} style={{ display: 'inline-block', marginTop: '8px', color: '#0d9488', fontWeight: 700, fontSize: '13px' }}>View Listing →</a>
                          </div>
                        </Popup>
                      </Marker>
                    )
                  ))}
                </MapContainer>
                {/* Premium vignette edge overlay */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 500, borderRadius: '20px', boxShadow: 'inset 0 0 60px rgba(0,0,0,0.06)' }}></div>
                {/* Map Legend */}
                <div style={{ position: 'absolute', bottom: '16px', left: '16px', zIndex: 1000, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', padding: '10px 14px', borderRadius: '10px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#da291c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M9 21V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v15"/><path d="M5 21V12a1 1 0 0 1 1-1h2"/><path d="M19 21V12a1 1 0 0 0-1-1h-2"/></svg>
                    <span style={{ fontWeight: 700, color: '#da291c' }}>This Project</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M9 21V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v15"/><path d="M5 21V12a1 1 0 0 1 1-1h2"/><path d="M19 21V12a1 1 0 0 0-1-1h-2"/></svg>
                    <span style={{ fontWeight: 700, color: '#333' }}>Nearby Developments</span>
                  </div>
                  {showListings && nearbyListings.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      <span style={{ fontWeight: 700, color: '#0d9488' }}>Active Listings ({nearbyListings.length})</span>
                    </div>
                  )}
                  {showIsochrone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
                      <span style={{ fontWeight: 700, color: '#3b82f6' }}>15-Min Walk Zone</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              SECTION 7: Similar Projects in this City
          ═══════════════════════════════════════════════════════ */}
          {similar.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>Similar Projects in {project.city}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {similar.map(s => (
                  <Link key={s.slug} href={`/new-construction/${s.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{
                      borderRadius: '16px', border: '1.5px solid #eee', overflow: 'hidden',
                      background: 'white', transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{
                        height: '140px',
                        background: s.photo_url
                          ? `url(${s.photo_url}) center/cover`
                          : `linear-gradient(135deg, ${s.color} 0%, ${s.color}66 100%)`,
                        display: 'flex', alignItems: 'flex-end', padding: '12px',
                      }}>
                        {s.trust_score && s.trust_score >= 90 && (
                          <div style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, border: '1px solid rgba(16,185,129,0.3)', backdropFilter: 'blur(8px)' }}>
                            BUILDER SCORE {s.trust_score}
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '16px 20px' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>{s.name}</p>
                        <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#888', fontWeight: 600 }}>by {s.builder}</p>
                        <p style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: project.color || '#da291c' }}>{s.price_from ? `From $${s.price_from.toLocaleString()}` : 'Pricing TBD'}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════
              SECTION 8: Investor Intelligence Dashboard
          ═══════════════════════════════════════════════════════ */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>Investor Intelligence</h2>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#888', lineHeight: 1.6, maxWidth: '700px' }}>
              Thinking about buying here as an investment? These numbers estimate how much rent you could earn,
              how the purchase price compares to nearby resale values, and how walkable/connected the neighbourhood is.
            </p>

            {/* Yield + Score Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {(() => {
                const avgPrice = project.price_from || 600000;
                const estRent = Math.round(avgPrice * 0.004); // ~0.4% monthly
                const capRate = ((estRent * 12) / avgPrice * 100).toFixed(1);
                const pricePerSqft = project.products && project.products.length > 0
                  ? Math.round(project.products.reduce((s: number, p: Product) => s + (p.price_from / (p.sqft || 1)), 0) / project.products.length)
                  : Math.round(avgPrice / 1200);
                const avgResale = nearbyListings.length > 0
                  ? Math.round(nearbyListings.reduce((s: number, l: any) => s + (l.list_price || 0), 0) / nearbyListings.length)
                  : 0;
                const appreciation = avgResale > 0 ? ((avgResale - avgPrice) / avgPrice * 100).toFixed(1) : null;

                const cards = [
                  { label: 'Est. Cap Rate', value: `${capRate}%`, accent: '#f59e0b', sub: `$${estRent.toLocaleString()}/mo est. rent` },
                  { label: 'Price / Sq Ft', value: `$${pricePerSqft}`, accent: '#3b82f6', sub: `Across ${project.products?.length || 0} models` },
                  { label: 'Avg Resale Nearby', value: avgResale > 0 ? `$${(avgResale / 1000).toFixed(0)}k` : 'N/A', accent: '#0d9488', sub: `${nearbyListings.length} active listings` },
                  { label: 'Price vs Resale', value: appreciation ? `${Number(appreciation) > 0 ? '+' : ''}${appreciation}%` : 'N/A', accent: Number(appreciation || 0) >= 0 ? '#10b981' : '#ef4444', sub: appreciation ? (Number(appreciation) >= 0 ? 'Below market — equity upside' : 'Premium over resale') : 'No data' },
                ];

                return cards.map((c, i) => (
                  <div key={i} style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '1.5px solid #eee' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{c.label}</div>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: c.accent, letterSpacing: '-1px', marginBottom: '4px' }}>{c.value}</div>
                    <div style={{ fontSize: '12px', color: '#aaa', fontWeight: 600 }}>{c.sub}</div>
                  </div>
                ));
              })()}
            </div>

            {/* Neighbourhood Scores */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {(() => {
                // Deterministic scores based on city characteristics
                const cityScores: Record<string, { walk: number; transit: number; schools: number; safety: number }> = {
                  'Toronto': { walk: 92, transit: 95, schools: 88, safety: 82 },
                  'Ottawa': { walk: 78, transit: 72, schools: 91, safety: 90 },
                  'Mississauga': { walk: 65, transit: 70, schools: 85, safety: 87 },
                  'Brampton': { walk: 55, transit: 60, schools: 82, safety: 80 },
                  'Hamilton': { walk: 70, transit: 65, schools: 80, safety: 78 },
                  'Pickering': { walk: 50, transit: 55, schools: 86, safety: 89 },
                  'Markham': { walk: 60, transit: 65, schools: 92, safety: 91 },
                  'Stittsville': { walk: 45, transit: 40, schools: 89, safety: 94 },
                  'Kemptville': { walk: 35, transit: 25, schools: 84, safety: 96 },
                };
                const scores = cityScores[project.city] || { walk: 60, transit: 55, schools: 82, safety: 85 };
                const scoreColor = (v: number) => v >= 80 ? '#10b981' : v >= 60 ? '#f59e0b' : '#ef4444';

                return [
                  { icon: '🚶', label: 'Walkability', value: scores.walk, grade: scores.walk >= 80 ? "Walker's Paradise" : scores.walk >= 60 ? 'Somewhat Walkable' : 'Car-Dependent' },
                  { icon: '🚇', label: 'Transit Score', value: scores.transit, grade: scores.transit >= 80 ? 'Excellent Transit' : scores.transit >= 60 ? 'Good Transit' : 'Minimal Transit' },
                  { icon: '🎓', label: 'School Rating', value: scores.schools, grade: scores.schools >= 85 ? 'Top-Rated Schools' : scores.schools >= 70 ? 'Good Schools' : 'Average Schools' },
                  { icon: '🛡️', label: 'Safety Index', value: scores.safety, grade: scores.safety >= 85 ? 'Very Safe' : scores.safety >= 70 ? 'Safe' : 'Average' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '20px', borderRadius: '16px', background: 'white', border: '1.5px solid #eee' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '18px' }}>{item.icon}</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#555' }}>{item.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '32px', fontWeight: 900, color: scoreColor(item.value), letterSpacing: '-1px' }}>{item.value}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#888' }}>/100</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', background: '#f0f0f0', overflow: 'hidden', marginBottom: '8px' }}>
                      <div style={{ height: '100%', width: `${item.value}%`, borderRadius: '3px', background: scoreColor(item.value), transition: 'width 1s ease' }}></div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: scoreColor(item.value) }}>{item.grade}</div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              SECTION 9: CTA
          ═══════════════════════════════════════════════════════ */}
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
              Request Priority Access →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
