'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MarketStats {
  city: string;
  median_price: number;
  avg_price: number;
  avg_days_on_market: number;
  active_count: number;
  new_this_week: number;
}

export default function MarketReportPage() {
  const [city, setCity] = useState('Ottawa');
  const [stats, setStats] = useState<MarketStats | null>(null);

  useEffect(() => {
    fetch(`/api/market/stats?city=${city}`)
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => setStats(null));
  }, [city]);

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#fafafa', paddingTop: '110px' }}>
      
      {/* Header Banner */}
      <div style={{ backgroundColor: '#111', padding: '60px 40px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 800, color: '#da291c', letterSpacing: '0.15em', textTransform: 'uppercase' }}>CREA DDF® Market Intelligence</p>
        <h1 style={{ margin: '0 0 24px', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: 'white', letterSpacing: '-2px', lineHeight: 1.1 }}>
          The Executive Market Report.
        </h1>
        <p style={{ margin: '0 auto 32px', fontSize: '18px', color: '#888', maxWidth: '600px', lineHeight: 1.6 }}>
          Live, dynamic data powered directly by the Canadian Real Estate Association (CREA) DDF feed. Select your market to see up-to-the-minute conditions.
        </p>
        
        {/* City Toggles */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {['Ottawa', 'Toronto', 'Vancouver', 'Calgary', 'Montreal', 'Mississauga'].map(c => (
            <button key={c} onClick={() => setCity(c)} style={{
              padding: '10px 24px', borderRadius: '100px',
              border: city === c ? '2px solid #da291c' : '1.5px solid #333',
              background: city === c ? '#da291c' : 'transparent',
              color: city === c ? 'white' : '#aaa',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
            }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Body */}
      <div style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {[
            { label: 'Active Listings', value: stats ? stats.active_count.toLocaleString() : '—', icon: '🏠', desc: 'Total homes actively for sale.' },
            { label: 'Median Sale Price', value: stats ? `$${(stats.median_price / 1000).toFixed(0)}K` : '—', icon: '💰', desc: 'The exact middle pricing tier.' },
            { label: 'Average List Price', value: stats ? `$${(stats.avg_price / 1000).toFixed(0)}K` : '—', icon: '📈', desc: 'Mean asking price in this city.' },
            { label: 'Avg Days on Market', value: stats ? String(stats.avg_days_on_market) : '—', icon: '⏱️', desc: 'How fast homes are selling.' },
            { label: 'New This Week', value: stats ? String(stats.new_this_week) : '—', icon: '🔥', desc: 'Fresh inventory dropped locally.' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', border: '1.5px solid #e5e5e5', borderRadius: '16px', padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{s.icon}</div>
              <p style={{ margin: '0 0 8px', fontSize: '36px', fontWeight: 900, color: '#111', letterSpacing: '-1.5px' }}>{s.value}</p>
              <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 800, color: '#333' }}>{s.label}</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#888', lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Action Interstitial */}
        <div style={{ background: 'white', border: '1.5px solid #e5e5e5', borderRadius: '20px', padding: '48px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '32px', fontWeight: 900, color: '#111', letterSpacing: '-1px' }}>Turn Data Into Action.</h2>
          <p style={{ margin: '0 auto 32px', fontSize: '16px', color: '#666', maxWidth: '500px', lineHeight: 1.6 }}>
            Ready to capitalize on the current {city} market conditions? Speak with an expert or find out what your specific home is worth right now.
          </p>
          <div style={{ display: 'inline-flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/sell" style={{ background: '#da291c', color: 'white', border: 'none', borderRadius: '10px', padding: '16px 32px', fontSize: '15px', fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 16px rgba(218,41,28,0.3)' }}>
              Check My Home Value
            </Link>
            <Link href="/sell" style={{ background: 'transparent', color: '#111', border: '1.5px solid #ccc', borderRadius: '10px', padding: '16px 32px', fontSize: '15px', fontWeight: 800, textDecoration: 'none' }}>
              Instant AI Valuation
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
