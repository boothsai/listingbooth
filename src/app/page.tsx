'use client';

import BuySection from '@/components/sections/BuySection';
import SellSection from '@/components/sections/SellSection';
import AgentsSection from '@/components/sections/AgentsSection';
import MapSearchSection from '@/components/sections/MapSearchSection';
import MarketTrendsSection from '@/components/sections/MarketTrendsSection';
import ToolsSection from '@/components/sections/ToolsSection';
import PlatformSection from '@/components/sections/PlatformSection';

export default function Home() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="hero-bg" style={{
        minHeight: '70vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '56px 24px 72px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Float card left */}
        <div className="float-1" style={{
          position: 'absolute', top: '25%', left: 'max(32px, 6%)', width: '220px',
          background: 'white', borderRadius: '16px', padding: '16px 20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)',
          borderLeft: '4px solid #da291c', display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <span style={{ display: 'block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#da291c' }} />
            <span className="ping-slow" style={{ position: 'absolute', top: 0, left: 0, display: 'block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#da291c', opacity: 0.4 }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#999', textTransform: 'uppercase' }}>New Match</p>
            <p style={{ margin: '3px 0 0', fontSize: '14px', fontWeight: 700, color: '#111' }}>4 Listings Found</p>
          </div>
        </div>

        {/* Float card right */}
        <div className="float-2" style={{
          position: 'absolute', bottom: '22%', right: 'max(32px, 6%)',
          width: '240px', background: '#111', borderRadius: '16px', padding: '20px 22px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.18)', border: '1px solid #222',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#666', textTransform: 'uppercase' }}>AI Appraisal</p>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#da291c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          </div>
          <p style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 800, color: 'white', letterSpacing: '-1px', fontFamily: 'var(--font-outfit)' }}>$2,150,000</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#da291c', fontWeight: 600, letterSpacing: '0.04em' }}>▲ 3.2% this quarter</p>
        </div>

        {/* Hero Copy */}
        <div style={{ maxWidth: '860px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '100px', backgroundColor: '#fef2f2', border: '1px solid rgba(218,41,28,0.2)', marginBottom: '32px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#da291c' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: '#da291c', textTransform: 'uppercase' }}>BOOTHS.AI Engine — Live</span>
          </div>

          <h1 style={{ margin: '0 0 28px', fontFamily: 'var(--font-inter), sans-serif', fontSize: 'clamp(44px, 8vw, 88px)', fontWeight: 900, letterSpacing: '-3px', lineHeight: 1.0, color: '#111' }}>
            Find Your Next <br /><span style={{ color: '#da291c' }}>Dream Home.</span>
          </h1>

          <p style={{ margin: '0 0 56px', fontFamily: 'var(--font-inter), sans-serif', fontSize: 'clamp(17px, 2.2vw, 22px)', fontWeight: 400, color: '#555', lineHeight: 1.65, maxWidth: '600px' }}>
            The fastest, most intelligent real estate search engine in North America — powered by autonomous AI agents and the BOOTHS.AI Mothership.
          </p>

          {/* Search */}
          <div className="search-bar" style={{ width: '100%', maxWidth: '680px', display: 'flex', alignItems: 'center', height: '70px', backgroundColor: 'white', borderRadius: '10px', border: '2px solid #e5e5e5', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.07)' }}>
            <div style={{ padding: '0 18px 0 22px', color: '#bbb', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input type="text" placeholder="City, neighborhood, or address..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: '17px', fontWeight: 500, color: '#111', background: 'transparent', fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '-0.3px' }} />
            <button style={{ height: '100%', padding: '0 36px', backgroundColor: '#da291c', color: 'white', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#b81e13')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#da291c')}
            >Search</button>
          </div>
          <p style={{ marginTop: '20px', fontSize: '13px', color: '#aaa', fontWeight: 500 }}>
            Try: <span style={{ color: '#555', fontStyle: 'italic' }}>&quot;Ottawa condos under $750K&quot;</span> or <span style={{ color: '#555', fontStyle: 'italic' }}>&quot;Toronto detached 4bed&quot;</span>
          </p>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ backgroundColor: '#da291c', padding: '28px 40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'clamp(32px, 6vw, 80px)', flexWrap: 'wrap' }}>
        {[{ num: '140,000+', label: 'Active Listings' }, { num: '87ms', label: 'Avg Search Time' }, { num: '$12B+', label: 'Listings Tracked' }, { num: '99.9%', label: 'Platform Uptime' }].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, color: 'white', fontFamily: 'var(--font-outfit)', letterSpacing: '-1px' }}>{stat.num}</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{stat.label}</p>
          </div>
        ))}
      </section>

      {/* ── ALL SECTIONS ── */}
      <BuySection />
      <SellSection />
      <AgentsSection />
      <MapSearchSection />
      <MarketTrendsSection />
      <ToolsSection />
      <PlatformSection />
    </>
  );
}
