'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';

interface Project {
  slug: string;
  name: string;
  builder: string;
  city: string;
  price_from: number;
  property_type: string;
  status: string;
  photo_url?: string | null;
  trust_score?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface NewConstructionMapProps {
  projects: Project[];
}

import { useState } from 'react';
import { CircleMarker } from 'react-leaflet';

export default function NewConstructionMap({ projects }: NewConstructionMapProps) {
  const [showRadarModal, setShowRadarModal] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  // Map real database coordinates
  const getCoordinates = (project: Project): [number, number] => {
    if (project.latitude && project.longitude) {
      return [project.latitude, project.longitude];
    }
    // Fallback if VABOT hasn't enriched GPS yet (Downtown Ottawa offset)
    return [45.4215, -75.6972];
  };

  const getCustomMarker = (project: Project) => {
    const isRegistration = project.status === 'Registration';
    const isHighTrust = (project.trust_score || 0) >= 90;
    
    const baseColor = isHighTrust ? '#10b981' : '#ffffff';
    const radarPulseHtml = isRegistration 
        ? `<div class="vip-radar-pulse"></div>` 
        : '';

    const formatPrice = (p: number) => {
      if (p >= 1000000) return `$${(p / 1000000).toFixed(1)}M`;
      if (p === 0) return 'TBD';
      return `$${Math.round(p / 1000)}k`;
    };

    return L.divIcon({
      html: `
        <div class="god-mode-pin" style="border-color: ${baseColor};">
          ${radarPulseHtml}
          <div class="pin-inner">
            ${formatPrice(project.price_from)}
          </div>
        </div>
      `,
      className: 'custom-god-mode-container',
      iconSize: [60, 30],
      iconAnchor: [30, 30],
      popupAnchor: [0, -35]
    });
  };
  // Auto-center map based on projects
  const projectsWithCoords = projects.filter(p => p.latitude && p.longitude);
  const mapCenter: [number, number] = projectsWithCoords.length > 0
    ? [
        projectsWithCoords.reduce((sum, p) => sum + (p.latitude || 0), 0) / projectsWithCoords.length,
        projectsWithCoords.reduce((sum, p) => sum + (p.longitude || 0), 0) / projectsWithCoords.length,
      ]
    : [43.65, -79.38]; // Default to Toronto

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={mapCenter} 
        zoom={11} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', background: '#f8f8f8' }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {showHeatmap && projectsWithCoords.map(p => {
          // Calculate an estimated cap rate / yield based on price to determine heat color
          // Purely visual logic for demo: lower price = higher yield = greener/hotter
          const isHot = p.price_from < 600000;
          const isWarm = p.price_from >= 600000 && p.price_from < 900000;
          const heatColor = isHot ? '#ef4444' : isWarm ? '#f59e0b' : '#3b82f6';
          const radius = isHot ? 2500 : isWarm ? 1800 : 1200; // in meters
          
          return (
            <CircleMarker
              key={`heat-${p.slug}`}
              center={[p.latitude!, p.longitude!]}
              radius={35} // pixel radius, but we can also use fixed circle
              pathOptions={{ fillColor: heatColor, fillOpacity: 0.15, color: heatColor, weight: 1 }}
            />
          );
        })}

        {projects.map(p => (
          <Marker 
            key={p.slug} 
            position={getCoordinates(p)} 
            icon={getCustomMarker(p)}
          >
            <Popup>
              <div style={{ padding: '16px', background: '#111', color: 'white' }}>
                <div style={{ fontSize: '10px', color: p.trust_score && p.trust_score >= 90 ? '#10b981' : '#888', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '8px', textTransform: 'uppercase' }}>
                  {p.status} {p.trust_score ? `• BUILDER SCORE ${p.trust_score}` : ''}
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 900 }}>{p.name}</h3>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>by {p.builder}</p>
                <Link href={`/new-construction/${p.slug}`} style={{ display: 'block', textAlign: 'center', background: 'white', color: '#111', padding: '8px', borderRadius: '4px', textDecoration: 'none', fontWeight: 800, fontSize: '12px' }}>
                  View Project
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Target Crosshair */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 400, opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #10b981' }}></div>
        <div style={{ position: 'absolute', width: '4px', height: '4px', background: '#10b981', borderRadius: '50%' }}></div>
      </div>

      {/* Map Tools Overlay */}
      <div style={{ position: 'absolute', bottom: '24px', left: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '320px' }}>
        {/* Heatmap Explainer Card — only visible when heatmap is active */}
        {showHeatmap && (
          <div style={{
            background: 'rgba(17,17,17,0.92)', backdropFilter: 'blur(16px)',
            borderRadius: '16px', padding: '16px 20px', color: 'white',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            <div style={{ fontSize: '13px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.3px' }}>
              📊 What does this heatmap show?
            </div>
            <p style={{ fontSize: '12px', lineHeight: 1.6, color: 'rgba(255,255,255,0.75)', margin: '0 0 12px' }}>
              The colored zones highlight <strong style={{ color: 'white' }}>estimated rental yield potential</strong> around each new development. 
              It helps you spot which areas may generate the <strong style={{ color: 'white' }}>best return on investment</strong> if you buy and rent out.
            </p>
            <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontWeight: 700 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', opacity: 0.8 }}></div>
                <span style={{ color: '#fca5a5' }}>High Yield</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', opacity: 0.8 }}></div>
                <span style={{ color: '#fcd34d' }}>Moderate</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6', opacity: 0.8 }}></div>
                <span style={{ color: '#93c5fd' }}>Premium</span>
              </div>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', margin: '10px 0 0', lineHeight: 1.5 }}>
              Red = more affordable entry, higher estimated rent-to-price ratio.
              Blue = premium pricing, lower yield but stronger appreciation.
            </p>
          </div>
        )}

        <button 
          onClick={() => setShowHeatmap(!showHeatmap)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px',
            background: showHeatmap ? '#111' : 'white', 
            color: showHeatmap ? 'white' : '#111', 
            border: '1px solid rgba(0,0,0,0.1)', 
            padding: '12px 20px', borderRadius: '12px', 
            fontSize: '13px', fontWeight: 800, cursor: 'pointer', 
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)', transition: 'all 0.2s', letterSpacing: '-0.3px'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={showHeatmap ? '#ef4444' : 'currentColor'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          {showHeatmap ? 'Investor Heatmap Active' : 'Show Investor Heatmap'}
        </button>
      </div>

      {/* VIP Tracker Button */}
      <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
        <button 
          onClick={() => setShowRadarModal(true)}
          style={{ background: '#10b981', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '100px', fontSize: '15px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 8px 32px rgba(16,185,129,0.4)', transition: 'transform 0.2s', letterSpacing: '-0.5px' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Track this 5km Radius
        </button>
      </div>

      {/* VIP Tracker Modal */}
      {showRadarModal && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '400px', color: 'white', position: 'relative' }}>
            <button 
              onClick={() => { setShowRadarModal(false); setSubmitted(false); }}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '20px' }}
            >
              ×
            </button>
            
            {!submitted ? (
              <>
                <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '6px 14px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>VIP Radar Active</div>
                <h3 style={{ margin: '0 0 12px', fontSize: '28px', fontWeight: 900, letterSpacing: '-1px' }}>Lock in this zone.</h3>
                <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#aaa', lineHeight: 1.6 }}>We'll instantly alert you when developers file zoning, update pricing, or launch VIP allocations inside this 5km boundary.</p>
                
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', marginBottom: '16px', fontSize: '15px' }}
                />
                
                <button 
                  onClick={async () => {
                    if (!email) return;
                    try {
                      await fetch('/api/leads', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          name: email.split('@')[0],
                          email,
                          lead_type: 'VIP Radar — New Construction',
                          listing_key: 'radar-drop-ottawa',
                          address: 'Live Radar Zone — Ottawa 5km',
                          message: 'Opted into VIP Radar Drop notifications for new construction zone alerts.',
                        }),
                      });
                    } catch { /* non-blocking */ }
                    setSubmitted(true);
                  }}
                  style={{ width: '100%', background: 'white', color: '#111', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '15px', fontWeight: 900, cursor: 'pointer' }}
                >
                  Activate Radar Notification
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                <h3 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 900 }}>Radar Locked.</h3>
                <p style={{ margin: 0, color: '#aaa', fontSize: '14px', lineHeight: 1.6 }}>Your email is securely linked. You have priority clearance for all developments landing in this sector.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper { padding: 0 !important; background: transparent !important; box-shadow: none !important; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
        .leaflet-popup-tip { background: #111 !important; border: 1px solid rgba(255,255,255,0.1); }
        .leaflet-popup-content { margin: 0 !important; width: 240px !important; }
        .leaflet-container a.leaflet-popup-close-button { color: white; right: 8px; top: 8px; text-shadow: none; z-index: 10; }
        
        .custom-god-mode-container { display: flex; align-items: flex-end; justify-content: center; background: none; border: none; z-index: 500 !important; }
        
        .god-mode-pin {
          position: relative;
          background: rgba(17,17,17,0.85);
          backdrop-filter: blur(8px);
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1.5px solid;
          font-weight: 900;
          font-size: 13px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: -0.5px;
        }

        .god-mode-pin:hover {
          transform: translateY(-4px) scale(1.05);
          z-index: 1000 !important;
          background: #fff;
          color: #111;
        }

        /* VIP Radar Pulse Animation */
        .vip-radar-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border-radius: 8px;
          background: rgba(218, 41, 28, 0.4);
          z-index: -1;
          animation: mapPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes mapPulse {
          0% { box-shadow: 0 0 0 0 rgba(218, 41, 28, 0.6); }
          70% { box-shadow: 0 0 0 20px rgba(218, 41, 28, 0); }
          100% { box-shadow: 0 0 0 0 rgba(218, 41, 28, 0); }
        }
      `}} />
    </div>
  );
}
