'use client';

import { useState } from 'react';
import Link from 'next/link';

/* ═══════════════════════════════════════════════════════
   REAL DATA — Sources: CREA, OREB, TRREB, OREA
   Report Period: February 2026
   Last Updated: March 2026
   ═══════════════════════════════════════════════════════ */

const REPORT_PERIOD = 'February 2026';
const LAST_UPDATED = 'March 15, 2026';

interface MarketData {
  city: string;
  board: string;
  boardUrl: string;
  avgPrice: number;
  avgPriceYoY: number;
  medianPrice: number;
  medianPriceYoY: number;
  totalSales: number;
  salesYoY: number;
  activeListings: number;
  activeListingsYoY: number;
  newListings: number;
  newListingsYoY: number;
  avgDOM: number;
  monthsInventory: number;
  hpiBenchmark: number;
  hpiYoY: number;
  detachedAvg: number;
  townhomeAvg: number;
  condoAvg: number;
  marketCondition: 'Buyer' | 'Balanced' | 'Seller';
  insight: string;
}

const MARKETS: MarketData[] = [
  {
    city: 'Ottawa',
    board: 'OREB',
    boardUrl: 'https://oreb.ca',
    avgPrice: 662773,
    avgPriceYoY: -1.0,
    medianPrice: 615450,
    medianPriceYoY: -3.1,
    totalSales: 780,
    salesYoY: -6.8,
    activeListings: 2928,
    activeListingsYoY: 11.1,
    newListings: 1582,
    newListingsYoY: -7.8,
    avgDOM: 42,
    monthsInventory: 3.8,
    hpiBenchmark: 615400,
    hpiYoY: -1.3,
    detachedAvg: 830951,
    townhomeAvg: 539639,
    condoAvg: 428538,
    marketCondition: 'Balanced',
    insight: 'Ottawa remains balanced with 3.8 months of inventory. Sales activity improved from January but remains 21% below the five-year average. Detached homes showed resilience with a 1.3% price increase YoY, while townhomes saw the steepest decline at -7.0%.',
  },
  {
    city: 'Toronto (GTA)',
    board: 'TRREB',
    boardUrl: 'https://trreb.ca',
    avgPrice: 1008968,
    avgPriceYoY: -7.1,
    medianPrice: 885000,
    medianPriceYoY: -6.5,
    totalSales: 3868,
    salesYoY: -6.3,
    activeListings: 19314,
    activeListingsYoY: 18.5,
    newListings: 10705,
    newListingsYoY: -17.7,
    avgDOM: 36,
    monthsInventory: 5.0,
    hpiBenchmark: 1040600,
    hpiYoY: -7.9,
    detachedAvg: 1568543,
    townhomeAvg: 864088,
    condoAvg: 663984,
    marketCondition: 'Buyer',
    insight: 'The GTA is firmly in buyer\'s market territory with 5.0 months of inventory. The HPI composite fell 7.9% YoY — the steepest annual decline since 2023. New listings dropped 17.7% indicating seller fatigue. Many buyers are waiting for price stabilization before entering.',
  },
  {
    city: 'Ontario (Province)',
    board: 'OREA / CREA',
    boardUrl: 'https://crea.ca',
    avgPrice: 802601,
    avgPriceYoY: -5.2,
    medianPrice: 695000,
    medianPriceYoY: -4.8,
    totalSales: 11789,
    salesYoY: -5.5,
    activeListings: 42500,
    activeListingsYoY: 22.0,
    newListings: 18200,
    newListingsYoY: -8.0,
    avgDOM: 38,
    monthsInventory: 3.6,
    hpiBenchmark: 746900,
    hpiYoY: -6.7,
    detachedAvg: 829100,
    townhomeAvg: 594300,
    condoAvg: 496200,
    marketCondition: 'Buyer',
    insight: 'Active listings have reached their highest February level in over a decade. The provincial HPI benchmark fell 6.7% YoY. Single-family homes showed most resilience at -6.3%, while condos and townhomes experienced steeper corrections of -8.8% and -8.1% respectively.',
  },
];

function formatCurrency(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function YoYBadge({ value }: { value: number }) {
  const color = value > 0 ? '#059669' : value < 0 ? '#dc2626' : '#888';
  const arrow = value > 0 ? '▲' : value < 0 ? '▼' : '—';
  return (
    <span style={{ fontSize: '13px', fontWeight: 700, color, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {arrow} {Math.abs(value).toFixed(1)}% YoY
    </span>
  );
}

export default function MarketReportPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const mkt = MARKETS[selectedIdx];

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: 'white' }}>
      
      {/* ── HERO HEADER ── */}
      <section style={{
        padding: '160px 5% 80px',
        position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(218,41,28,0.06) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
        
        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: '4px', background: 'rgba(218,41,28,0.1)', color: '#da291c', fontWeight: 800, fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#da291c', boxShadow: '0 0 8px #da291c' }} />
            Live Market Intelligence
          </div>
          
          <h1 style={{ margin: '0 0 24px', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1.05 }}>
            The Executive<br/>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Market Report.</span>
          </h1>
          
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)', margin: '0 0 40px', maxWidth: '700px', lineHeight: 1.5, fontWeight: 500 }}>
            Real data from CREA, OREB, and TRREB — not estimates. Updated monthly with official board statistics so you can make decisions with institutional-grade intelligence.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Report Period: <strong style={{ color: 'white' }}>{REPORT_PERIOD}</strong></span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Updated: <strong style={{ color: 'white' }}>{LAST_UPDATED}</strong></span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Sources: <strong style={{ color: 'white' }}>CREA · OREB · TRREB · OREA</strong></span>
          </div>
        </div>
      </section>

      {/* ── MARKET SELECTOR ── */}
      <section style={{ padding: '40px 5%', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {MARKETS.map((m, i) => (
            <button key={m.city} onClick={() => setSelectedIdx(i)} style={{
              padding: '16px 32px', borderRadius: '16px',
              border: selectedIdx === i ? '2px solid #da291c' : '1px solid rgba(255,255,255,0.1)',
              background: selectedIdx === i ? 'rgba(218,41,28,0.1)' : 'rgba(255,255,255,0.03)',
              color: selectedIdx === i ? 'white' : 'rgba(255,255,255,0.6)',
              fontSize: '16px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start',
            }}>
              <span>{m.city}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: selectedIdx === i ? '#da291c' : 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {m.board}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── MAIN DATA GRID ── */}
      <section style={{ padding: '80px 5%' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Hero Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
            {[
              { label: 'Average Sale Price', value: `$${mkt.avgPrice.toLocaleString()}`, yoy: mkt.avgPriceYoY },
              { label: 'Total Sales', value: mkt.totalSales.toLocaleString(), yoy: mkt.salesYoY },
              { label: 'Active Listings', value: mkt.activeListings.toLocaleString(), yoy: mkt.activeListingsYoY },
              { label: 'Avg Days on Market', value: String(mkt.avgDOM), yoy: 0 },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.06)', padding: '32px',
              }}>
                <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</p>
                <p style={{ margin: '0 0 8px', fontSize: '36px', fontWeight: 900, color: 'white', letterSpacing: '-1.5px', lineHeight: 1 }}>{s.value}</p>
                <YoYBadge value={s.yoy} />
              </div>
            ))}
          </div>

          {/* Bento Box: Price Breakdown + Market Condition + Insight */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '48px' }}>
            
            {/* Price by Property Type */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.06)', padding: '40px',
            }}>
              <h3 style={{ margin: '0 0 32px', fontSize: '20px', fontWeight: 800, color: 'white' }}>Average Price by Property Type</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { type: 'Detached / Single-Family', price: mkt.detachedAvg, color: '#da291c', width: '100%' },
                  { type: 'Townhomes / Row', price: mkt.townhomeAvg, color: '#2563eb', width: `${(mkt.townhomeAvg / mkt.detachedAvg) * 100}%` },
                  { type: 'Condominiums', price: mkt.condoAvg, color: '#7c3aed', width: `${(mkt.condoAvg / mkt.detachedAvg) * 100}%` },
                ].map(p => (
                  <div key={p.type}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{p.type}</span>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>${p.price.toLocaleString()}</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: p.width, background: p.color, borderRadius: '100px', transition: 'width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Condition + HPI */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{
                background: mkt.marketCondition === 'Buyer' ? 'rgba(37,99,235,0.1)' : mkt.marketCondition === 'Seller' ? 'rgba(218,41,28,0.1)' : 'rgba(255,255,255,0.03)',
                borderRadius: '24px',
                border: `1px solid ${mkt.marketCondition === 'Buyer' ? 'rgba(37,99,235,0.2)' : mkt.marketCondition === 'Seller' ? 'rgba(218,41,28,0.2)' : 'rgba(255,255,255,0.06)'}`,
                padding: '40px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'
              }}>
                <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Market Condition</p>
                <p style={{ margin: '0 0 8px', fontSize: '32px', fontWeight: 900, color: mkt.marketCondition === 'Buyer' ? '#3b82f6' : mkt.marketCondition === 'Seller' ? '#da291c' : 'white' }}>
                  {mkt.marketCondition}{"'"}s Market
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>{mkt.monthsInventory} months of inventory</p>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.06)', padding: '40px', flex: 1,
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'
              }}>
                <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>MLS® HPI Benchmark</p>
                <p style={{ margin: '0 0 8px', fontSize: '32px', fontWeight: 900, color: 'white' }}>{formatCurrency(mkt.hpiBenchmark)}</p>
                <YoYBadge value={mkt.hpiYoY} />
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
            {[
              { label: 'Median Price', value: `$${mkt.medianPrice.toLocaleString()}`, yoy: mkt.medianPriceYoY },
              { label: 'New Listings', value: mkt.newListings.toLocaleString(), yoy: mkt.newListingsYoY },
              { label: 'Months of Inventory', value: String(mkt.monthsInventory), yoy: 0 },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.06)', padding: '32px',
              }}>
                <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</p>
                <p style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>{s.value}</p>
                <YoYBadge value={s.yoy} />
              </div>
            ))}
          </div>

          {/* AI Analyst Insight */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(218,41,28,0.1) 0%, rgba(218,41,28,0.03) 100%)',
            borderRadius: '24px', border: '1px solid rgba(218,41,28,0.15)',
            padding: '48px', marginBottom: '48px',
            display: 'flex', gap: '24px', alignItems: 'flex-start'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(218,41,28,0.2)', color: '#da291c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '20px' }}>
              ✨
            </div>
            <div>
              <h3 style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: 800, color: 'white' }}>AI Market Insight — {mkt.city}</h3>
              <p style={{ margin: 0, fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontWeight: 500 }}>
                {mkt.insight}
              </p>
            </div>
          </div>

          {/* Data Source Attribution */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)', padding: '24px 32px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
            marginBottom: '48px'
          }}>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
              Data sourced from <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{mkt.board}</strong> official monthly statistics report for {REPORT_PERIOD}.
              MLS® and HPI are trademarks of the Canadian Real Estate Association.
            </p>
            <Link href={mkt.boardUrl} target="_blank" style={{ fontSize: '13px', color: '#da291c', fontWeight: 700, textDecoration: 'none' }}>
              View Source Report →
            </Link>
          </div>

          {/* CTA */}
          <div style={{
            background: 'linear-gradient(135deg, #da291c 0%, #b81e13 100%)',
            borderRadius: '32px', padding: '64px', textAlign: 'center',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', zIndex: 0 }} />
            <div style={{ position: 'relative', zIndex: 10 }}>
              <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>
                Turn Data Into Action.
              </h2>
              <p style={{ margin: '0 auto 32px', fontSize: '18px', color: 'rgba(255,255,255,0.85)', maxWidth: '600px', lineHeight: 1.5 }}>
                The {mkt.city} market is giving clear signals. Whether you{"'"}re buying, selling, or investing — now{"'"}s the time to move with confidence.
              </p>
              <div style={{ display: 'inline-flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link href="/sell" style={{ background: 'white', color: '#da291c', padding: '16px 40px', borderRadius: '100px', fontSize: '16px', fontWeight: 900, textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                  Check My Home Value
                </Link>
                <Link href="/buy" style={{ background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '16px 40px', borderRadius: '100px', fontSize: '16px', fontWeight: 900, textDecoration: 'none' }}>
                  Browse Listings
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
