'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('@/components/DynamicMap'), {
  ssr: false,
  loading: () => <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontWeight: 600 }}>Loading map data...</div>
});

interface MarketStats {
  city: string;
  active_count: number;
  avg_price: number;
  median_price: number;
  new_this_week: number;
  avg_days_on_market: number;
}

function fmt(n: number) {
  if (!n) return '—';
  return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${Math.round(n / 1000)}K`;
}

export default function MapSearchSection() {
  const [city] = useState('Ottawa');
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [liveCount, setLiveCount] = useState<number>(0);

  useEffect(() => {
    fetch(`/api/market/stats?city=${city}`)
      .then(r => r.json())
      .then(d => setStats(d.stats ?? null))
      .catch(() => {});
  }, [city]);

  return (
    <section id="map-search" style={{ backgroundColor: '#fafafa', padding: '80px 0', borderTop: '1px solid #f0f0f0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>

        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: '#da291c', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Interactive Map</p>
            <h2 style={{ margin: '0 0 12px', fontSize: '42px', fontWeight: 900, letterSpacing: '-1.5px', color: '#111', lineHeight: 1.0 }}>Search The Map.</h2>
            <p style={{ margin: 0, fontSize: '17px', color: '#666', maxWidth: '560px', lineHeight: 1.6 }}>
              Draw your ideal neighbourhood. See real-time listing pins, school zones, transit lines, and price heat maps.
            </p>
          </div>
          {/* Layer toggles */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['Listings', 'Schools', 'Transit', 'Heat Map', 'Flood Risk'].map((l, i) => (
              <button key={l} style={{
                padding: '8px 16px', borderRadius: '100px',
                border: i < 2 ? '2px solid #da291c' : '1.5px solid #e5e5e5',
                background: i < 2 ? '#da291c' : 'white',
                color: i < 2 ? 'white' : '#555',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Map container */}
        <div style={{ borderRadius: '20px', overflow: 'hidden', border: '2px solid #e5e5e5', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', position: 'relative', height: '520px', background: '#e9e4dc' }}>
          {/* React Leaflet Dynamic Maps */}
          <DynamicMap onStatsUpdate={setLiveCount} city={city} />

          {/* Overlay filter bar */}
          <div style={{
            position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)',
            background: 'white', borderRadius: '100px', padding: '8px 16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '12px',
            whiteSpace: 'nowrap',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#da291c" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span style={{ fontSize: '14px', color: '#666', fontWeight: 600 }}>{city}, Ontario</span>
            <span style={{ width: '1px', height: '16px', background: '#eee' }} />
            <span style={{ fontSize: '13px', color: '#da291c', fontWeight: 800 }}>
              {liveCount} active listings in view
            </span>
          </div>

          {/* Draw zone + legend */}
          <div style={{ position: 'absolute', bottom: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button style={{ background: '#da291c', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(218,41,28,0.4)' }}>
              ✏️ Draw My Zone
            </button>
            <button style={{ background: 'white', color: '#111', border: '1.5px solid #e5e5e5', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              📍 Save This Search
            </button>
          </div>
        </div>

        {/* Live quick-stats from /api/market/stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '24px' }}>
          {[
            { label: 'Active in View', value: stats ? stats.active_count.toString() : '—' },
            { label: 'Avg. Price', value: stats ? fmt(stats.avg_price) : '—' },
            { label: 'New This Week', value: stats ? stats.new_this_week.toString() : '—' },
            { label: 'Avg. DOM', value: stats ? `${stats.avg_days_on_market}d` : '—' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', border: '1.5px solid #eee', textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 900, color: '#111', letterSpacing: '-1px' }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '12px', fontSize: '10px', color: '#bbb', textAlign: 'center' }}>
          Data © CREA DDF® · Brokered by eXp Realty Canada · Stats update with each DDF sync
        </p>
      </div>
    </section>
  );
}
