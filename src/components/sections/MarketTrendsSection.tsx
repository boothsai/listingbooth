'use client';

import { useEffect, useState } from 'react';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const priceData = [890, 905, 920, 945, 971, 988, 972, 958, 975, 994, 1010, 1024];

interface MarketStats { city: string; median_price: number; avg_price: number; avg_days_on_market: number; active_count: number; new_this_week: number; }
const maxPrice = Math.max(...priceData);

export default function MarketTrendsSection() {
  const [city, setCity] = useState('Ottawa');
  const [stats, setStats] = useState<MarketStats | null>(null);

  useEffect(() => {
    fetch(`/api/market/stats?city=${city}`)
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => setStats(null));
  }, [city]);
  return (
    <section id="market-trends" style={{ backgroundColor: '#fff', padding: '80px 0', borderTop: '1px solid #f0f0f0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: '#da291c', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Market Intelligence</p>
            <h2 style={{ margin: '0 0 12px', fontSize: '42px', fontWeight: 900, letterSpacing: '-1.5px', color: '#111', lineHeight: 1.0 }}>Know The Market.<br />Win Every Offer.</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Ottawa', 'Toronto', 'Vancouver', 'Calgary', 'Montreal'].map((c, i) => (
              <button key={c} onClick={() => setCity(c)} style={{ padding: '8px 16px', borderRadius: '100px', border: city === c ? '2px solid #da291c' : '1.5px solid #e5e5e5', background: city === c ? '#da291c' : 'white', color: city === c ? 'white' : '#555', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }} aria-pressed={city === c}>{c}</button>
            ))}
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '48px' }}>
          {[
            { label: 'Median Price', value: stats ? `$${(stats.median_price / 1000).toFixed(0)}K` : '—', change: '1.2%', up: true },
            { label: 'Avg Days on Mkt', value: stats ? String(stats.avg_days_on_market) : '—', change: '2d', up: true },
            { label: 'Active Listings', value: stats ? stats.active_count.toLocaleString() : '—', change: '4.5%', up: false },
            { label: 'New This Week', value: stats ? String(stats.new_this_week) : '—', change: '12%', up: true },
            { label: 'Avg Price', value: stats ? `$${(stats.avg_price / 1000).toFixed(0)}K` : '—', change: '0.8%', up: true },
          ].map(s => (
            <div key={s.label} style={{ background: '#fafafa', borderRadius: '12px', padding: '20px', border: '1.5px solid #eee' }}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</p>
              <p style={{ margin: '0 0 6px', fontSize: '26px', fontWeight: 900, color: '#111', letterSpacing: '-1px' }}>{s.value}</p>
              <span style={{ fontSize: '12px', fontWeight: 700, color: s.up ? '#059669' : '#da291c' }}>{s.up ? '▲' : '▼'} {s.change}</span>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div style={{ background: '#fafafa', borderRadius: '20px', border: '1.5px solid #eee', padding: '36px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: '#111' }}>Median Sales Price — Ottawa 2025</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>Monthly residential resale</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['1Y', '2Y', '5Y'].map((t, i) => (
                <button key={t} style={{ padding: '6px 14px', borderRadius: '100px', border: i === 0 ? '2px solid #da291c' : '1.5px solid #e5e5e5', background: i === 0 ? '#da291c' : 'white', color: i === 0 ? 'white' : '#555', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '180px' }}>
            {priceData.map((p, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '100%', borderRadius: '6px 6px 0 0', background: i === priceData.length - 1 ? '#da291c' : `rgba(218,41,28,${0.3 + (p / maxPrice) * 0.5})`, height: `${(p / maxPrice) * 160}px`, cursor: 'pointer' }} title={`${months[i]}: $${p}K`} />
                <span style={{ fontSize: '10px', color: '#aaa', fontWeight: 600 }}>{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Neighbourhood table */}
        <div style={{ background: '#fafafa', borderRadius: '20px', border: '1.5px solid #eee', overflow: 'hidden' }}>
          <div style={{ padding: '24px 28px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#111' }}>Hottest Neighbourhoods</p>
            <a href="#" style={{ fontSize: '13px', fontWeight: 700, color: '#da291c', textDecoration: 'none' }}>View Full Report →</a>
          </div>
          {[
            { rank: 1, name: 'Westboro', city: 'Ottawa', median: '$1.12M', dom: 8, ratio: '104%', chg: '+6.2%' },
            { rank: 2, name: 'The Glebe', city: 'Ottawa', median: '$1.34M', dom: 11, ratio: '102%', chg: '+4.1%' },
            { rank: 3, name: 'Hintonburg', city: 'Ottawa', median: '$945K', dom: 9, ratio: '103%', chg: '+8.4%' },
            { rank: 4, name: 'Riverside South', city: 'Ottawa', median: '$875K', dom: 14, ratio: '100%', chg: '+3.2%' },
          ].map(n => (
            <div key={n.rank} style={{ display: 'grid', gridTemplateColumns: '40px 2fr 1fr 1fr 1fr 1fr', padding: '16px 28px', borderBottom: '1px solid #f0f0f0', alignItems: 'center', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontWeight: 900, color: '#da291c', fontSize: '18px' }}>{n.rank}</span>
              <div><p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: '15px', color: '#111' }}>{n.name}</p><p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{n.city}</p></div>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#111' }}>{n.median}</span>
              <span style={{ fontWeight: 600, fontSize: '14px', color: '#555' }}>{n.dom}d</span>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#111' }}>{n.ratio}</span>
              <span style={{ fontWeight: 800, fontSize: '14px', color: '#059669' }}>{n.chg}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
