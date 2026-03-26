'use client';

import Link from 'next/link';
import MapSearchSection from '@/components/sections/MapSearchSection';

export default function ConsumerHome() {
  return (
    <>
      {/* ── HIGH CONVERSION HERO SECTION ── */}
      <section style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fafafa',
        overflow: 'hidden',
        padding: '80px 24px 40px' // Tightened to immediately reveal the house grid
      }}>
        
        {/* Background geometric flare (Brand compliant) */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(218,41,28,0.05) 0%, rgba(250,250,250,0) 70%)', filter: 'blur(40px)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(17,17,17,0.03) 0%, rgba(250,250,250,0) 70%)', filter: 'blur(40px)', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '960px', padding: '0 24px' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(218,41,28,0.1)', padding: '6px 16px', borderRadius: '100px', marginBottom: '32px' }}>
            <span style={{ fontSize: '10px', fontWeight: 900, color: 'white', background: '#da291c', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.1em' }}>LIVE</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#da291c', letterSpacing: '0.05em' }}>Real-Time MLS® & VOW Market Data</span>
          </div>

          <h1 style={{ margin: '0 0 24px', fontFamily: 'var(--font-inter), sans-serif', fontSize: 'clamp(56px, 8vw, 88px)', fontWeight: 900, color: '#111', letterSpacing: '-2.5px', lineHeight: 1.05 }}>
            The smarter way to<br />buy and sell homes.
          </h1>
          
          <p style={{ margin: '0 auto 48px', fontSize: 'clamp(18px, 2vw, 22px)', color: '#555', lineHeight: 1.6, maxWidth: '680px', fontWeight: 500 }}>
            Search thousands of active listings, get instant AI-driven home valuations, and unlock historical sold data previously hidden from the public.
          </p>

          {/* OMNI-SEARCH INPUT TRINITY */}
          <div style={{
            display: 'flex', alignItems: 'center', backgroundColor: 'white',
            borderRadius: '100px', padding: '8px', boxShadow: '0 12px 48px rgba(0,0,0,0.1)',
            maxWidth: '740px', margin: '0 auto', border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <svg style={{ marginLeft: '16px', color: '#888' }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Address, Neighborhood, City, or MLS® Number"
              style={{
                flex: 1, border: 'none', outline: 'none', padding: '16px', fontSize: '18px',
                fontFamily: 'var(--font-inter), sans-serif', fontWeight: 500, color: '#111', background: 'transparent'
              }}
            />
            {/* AI Image Search CTA */}
            <button 
              onClick={() => alert('Visual AI Search matrix initializing. Please upload a photo of your desired home style.')}
              style={{
              background: 'rgba(218,41,28,0.08)', color: '#da291c', border: '1px solid rgba(218,41,28,0.2)',
              borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px',
              cursor: 'pointer', marginRight: '16px', fontWeight: 800, fontSize: '12px', whiteSpace: 'nowrap'
            }} title="Upload a photo of your dream home to find visually similar listings across Canada!">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              AI IMAGE SEARCH
            </button>
            <Link href="/buy" style={{
              backgroundColor: '#da291c', color: 'white', textDecoration: 'none',
              padding: '16px 36px', borderRadius: '100px', fontSize: '16px', fontWeight: 800,
              fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '0.02em', transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(218,41,28,0.3)'
            }}
             onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#b81e13'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
             onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#da291c'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              SEARCH
            </Link>
          </div>
          
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '24px' }}>
            {['Toronto', 'Mississauga', 'Oakville', 'Vaughan'].map(city => (
              <Link key={city} href="/buy" style={{ color: '#666', fontSize: '14px', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#da291c'} onMouseLeave={e => e.currentTarget.style.color = '#666'}>
                {city}
              </Link>
            ))}
          </div>
        </div>

      </section>

      {/* MOVE MAP SEARCH TO TOP UNDER HERO */}
      <MapSearchSection />

      {/* ── QUICK STATS BAR ── */}
      <section style={{ backgroundColor: '#111', padding: '60px 24px', borderTop: '4px solid #da291c' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '40px' }}>
          {[
            { metric: '25,000+', label: 'Active Listings' },
            { metric: '4+ Years', label: 'Historical Sold Data' },
            { metric: 'Real-Time', label: 'AI Home Valuations' },
            { metric: '100%', label: 'Free Market Transparency' }
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px', fontSize: '42px', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>{stat.metric}</p>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

    </>
  );
}
