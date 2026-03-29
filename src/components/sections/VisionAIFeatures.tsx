'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface DemoListing {
  name?: string;
  city?: string;
  property_type?: string;
  status?: string;
  main_image_url?: string;
  price_from?: number;
}

export default function VisionAIFeatures() {
  const [demo, setDemo] = useState<DemoListing | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function loadWiredData() {
      // Pull a real listing from core_logic to use as the visual demo
      const { data, error } = await supabase
        .schema('core_logic')
        .from('new_construction_projects')
        .select('*')
        .limit(1)
        .single();

      if (!error && data) setDemo(data);

      // Get total count for the stats display
      const { count } = await supabase
        .schema('core_logic')
        .from('new_construction_projects')
        .select('*', { count: 'exact', head: true });

      if (count) setTotalCount(count);
    }
    loadWiredData();
  }, []);

  const displayName = demo?.name || 'Loading...';
  const displayCity = demo?.city || '—';
  const displayType = demo?.property_type || '—';
  const displayStatus = demo?.status || '—';

  return (
    <section style={{ padding: '120px 5%', background: '#0a0a0a', color: 'white', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Ambient Glow */}
      <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(218,41,28,0.05) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '80px', maxWidth: '800px' }}>
          <div style={{ 
            display: 'inline-flex', padding: '6px 12px', borderRadius: '4px', 
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#da291c', fontWeight: 800, fontSize: '12px', letterSpacing: '0.15em',
            textTransform: 'uppercase', marginBottom: '24px'
          }}>
            Wired Architecture
          </div>
          <h2 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 900, margin: '0 0 32px', letterSpacing: '-0.04em', lineHeight: 1.05, color: 'white' }}>
            We don't search by keywords.<br/>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>We search by physics, light,<br/>and geometry.</span>
          </h2>
          <p style={{ fontSize: '22px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
            While outdated brokerages rely on lazy, inaccurate agent descriptions, ListingBooth&apos;s bare-metal GPU cluster analyzes the actual visual DNA of every property on the market.
          </p>
        </div>

        {/* Bento Box Layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(12, 1fr)', 
          gridAutoRows: '420px',
          gap: '24px' 
        }}>
          
          {/* Card 1: Live Asset Preview (Spans 8 cols) - WIRED */}
          <div style={{ 
            gridColumn: 'span 8', 
            background: 'rgba(255,255,255,0.03)', borderRadius: '32px', 
            border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
            display: 'flex', position: 'relative',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02)'
          }}>
            {/* Visual Side — Real image from database */}
            <div style={{ flex: 1, position: 'relative', background: '#111', borderRight: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              {demo?.main_image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={demo.main_image_url} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px', fontWeight: 600 }}>
                  Connecting to core_logic...
                </div>
              )}
              
              {/* Real data overlays from database */}
              <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.8)', border: '1px solid #da291c', color: '#da291c', borderRadius: '4px', fontSize: '11px', fontWeight: 800, backdropFilter: 'blur(4px)' }}>
                  TYPE: {displayType.toUpperCase()}
                </div>
                <div style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '4px', fontSize: '11px', fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                  CITY: {displayCity.toUpperCase()}
                </div>
                <div style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '4px', fontSize: '11px', fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                  STATUS: {displayStatus.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Text Side */}
            <div style={{ width: '380px', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(218,41,28,0.1)', color: '#da291c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'white', margin: '0 0 16px', letterSpacing: '-0.5px', lineHeight: 1.2 }}>Live Asset Preview</h3>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                This card is pulling a real pre-construction project directly from the <code style={{ color: '#da291c', fontSize: '14px' }}>core_logic</code> database. No mockups. No stock photos. What you see is what exists.
              </p>
            </div>
          </div>

          {/* Card 2: Database Stats (Spans 4 cols) - WIRED */}
          <div style={{ 
            gridColumn: 'span 4', 
            background: 'rgba(255,255,255,0.03)', borderRadius: '32px', 
            border: '1px solid rgba(255,255,255,0.06)', padding: '40px',
            display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(37,99,235,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'white', margin: '0 0 16px', letterSpacing: '-0.5px' }}>Data Transparency</h3>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6, fontWeight: 500, position: 'relative', zIndex: 2 }}>
              Every number on this page is sourced from a live Supabase query. Our extraction fleet runs autonomously 5 days a week to keep this data fresh.
            </p>

            {/* Live Stats from Database */}
            <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
              <div style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', fontSize: '13px', fontWeight: 700, color: 'white' }}>
                {totalCount} Projects Indexed
              </div>
              <div style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', fontSize: '13px', fontWeight: 700, color: 'white' }}>
                core_logic Schema
              </div>
            </div>

            {/* Glowing orb */}
            <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)', borderRadius: '50%', zIndex: 1 }} />
          </div>

          {/* Card 3: Live Feed (Spans 12 cols, wide format) - WIRED */}
          <div style={{ 
            gridColumn: 'span 12', 
            background: 'rgba(255,255,255,0.03)', borderRadius: '32px', 
            border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
            display: 'flex', position: 'relative', height: '280px'
          }}>
            <div style={{ flex: '1', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 2 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(124,58,237,0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'white', margin: '0 0 16px', letterSpacing: '-0.5px' }}>Autonomous Extraction Fleet</h3>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6, fontWeight: 500, maxWidth: '600px' }}>
                Our VABOT fleet crawls builder websites autonomously every weekday at 4:00 AM. New floorplans, price drops, and inventory changes are ingested directly into the <code style={{ color: '#8b5cf6', fontSize: '14px' }}>core_logic</code> schema before anyone else sees them.
              </p>
            </div>
            
            {/* Live property card from DB */}
            <div style={{ flex: '1', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {demo && (
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', width: '320px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                    LIVE FROM DATABASE
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
                    {displayName}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', padding: '4px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px' }}>
                      📍 {displayCity}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', padding: '4px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px' }}>
                      {displayType}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', padding: '4px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px' }}>
                      {displayStatus}
                    </span>
                  </div>
                  {demo.price_from && (
                    <div style={{ marginTop: '12px', fontSize: '18px', fontWeight: 800, color: '#8b5cf6' }}>
                      From ${demo.price_from.toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Decorative background glow */}
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '50%', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.05))', zIndex: 1 }} />
          </div>

        </div>
      </div>
    </section>
  );
}
