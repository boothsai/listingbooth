'use client';

import { useState } from 'react';

function MortgageCalc() {
  const [price, setPrice] = useState(850000);
  const [down, setDown] = useState(170000);
  const [rate, setRate] = useState(5.19);
  const [years, setYears] = useState(25);

  const principal = price - down;
  const monthlyRate = rate / 100 / 12;
  const n = years * 12;
  const monthly = principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  const total = monthly * n;
  const totalInterest = total - principal;
  const downPct = ((down / price) * 100).toFixed(1);

  return (
    <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid #eee', padding: '36px' }}>
      <h3 style={{ margin: '0 0 28px', fontSize: '22px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>Mortgage Calculator</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {[
          { label: 'Home Price', value: price, set: setPrice, prefix: '$', min: 100000, max: 5000000, step: 10000 },
          { label: `Down Payment (${downPct}%)`, value: down, set: setDown, prefix: '$', min: 0, max: price, step: 5000 },
          { label: 'Interest Rate (%)', value: rate, set: setRate, prefix: '', min: 1, max: 15, step: 0.01 },
          { label: 'Amortization (years)', value: years, set: setYears, prefix: '', min: 5, max: 30, step: 5 },
        ].map(f => (
          <div key={f.label}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{f.label}</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
              {f.prefix && <span style={{ padding: '0 12px', background: '#f5f5f5', color: '#888', fontWeight: 700, fontSize: '15px', borderRight: '1.5px solid #e5e5e5', height: '44px', display: 'flex', alignItems: 'center' }}>{f.prefix}</span>}
              <input type="number" value={f.value} onChange={e => f.set(Number(e.target.value))} min={f.min} max={f.max} step={f.step}
                style={{ flex: 1, border: 'none', outline: 'none', padding: '0 12px', height: '44px', fontSize: '16px', fontWeight: 700, color: '#111', background: 'white' }} />
            </div>
          </div>
        ))}
      </div>
      {/* Result */}
      <div style={{ background: '#111', borderRadius: '12px', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Monthly Payment</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>${Math.round(monthly).toLocaleString()}</p>
        </div>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Interest</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#da291c', letterSpacing: '-1px' }}>${Math.round(totalInterest).toLocaleString()}</p>
        </div>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Cost</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>${Math.round(total).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

export default function ToolsSection() {
  const [income, setIncome] = useState(120000);
  const [debt, setDebt] = useState(500);
  const maxHome = income * 4.5;
  const gds = ((2200 / (income / 12)) * 100).toFixed(1);

  return (
    <section id="tools" style={{ backgroundColor: '#fafafa', padding: '80px 0', borderTop: '1px solid #f0f0f0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        <div style={{ marginBottom: '48px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: '#da291c', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Power Tools</p>
          <h2 style={{ margin: '0 0 12px', fontSize: '42px', fontWeight: 900, letterSpacing: '-1.5px', color: '#111', lineHeight: 1.0 }}>Every Calculator You Need.</h2>
          <p style={{ margin: 0, fontSize: '17px', color: '#666', maxWidth: '560px', lineHeight: 1.6 }}>From mortgage payments to CMHC insurance — make every financial decision with precision.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
          {/* Mortgage calc (large) */}
          <MortgageCalc />

          {/* Right column: affordability + other tools */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Affordability */}
            <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid #eee', padding: '28px' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>Affordability Check</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                {[
                  { label: 'Annual Gross Income', value: income, set: setIncome, prefix: '$' },
                  { label: 'Monthly Debts', value: debt, set: setDebt, prefix: '$' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{f.label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
                      <span style={{ padding: '0 12px', background: '#f5f5f5', color: '#888', fontWeight: 700, fontSize: '15px', borderRight: '1.5px solid #e5e5e5', height: '40px', display: 'flex', alignItems: 'center' }}>$</span>
                      <input type="number" value={f.value} onChange={e => f.set(Number(e.target.value))} style={{ flex: 1, border: 'none', outline: 'none', padding: '0 12px', height: '40px', fontSize: '15px', fontWeight: 700, color: '#111', background: 'white' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fef2f2', borderRadius: '10px', padding: '16px 20px', border: '1px solid rgba(218,41,28,0.15)' }}>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#da291c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Max Home Price</p>
                <p style={{ margin: '0 0 8px', fontSize: '32px', fontWeight: 900, color: '#111', letterSpacing: '-1px' }}>${maxHome.toLocaleString()}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>GDS Ratio: <strong style={{ color: '#111' }}>{gds}%</strong> · Recommended: under 32%</p>
              </div>
            </div>

            {/* Quick tool links */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { title: 'Land Transfer Tax', icon: '🏛️', desc: 'Calculate closing costs' },
                { title: 'CMHC Insurance', icon: '🛡️', desc: 'Default insurance estimate' },
                { title: 'Rent vs. Buy', icon: '⚖️', desc: 'Which makes sense for you?' },
                { title: 'Home Equity', icon: '💎', desc: 'Track your equity growth' },
              ].map(t => (
                <button key={t.title} style={{ background: 'white', border: '1.5px solid #eee', borderRadius: '12px', padding: '18px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#da291c'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(218,41,28,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{t.icon}</div>
                  <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 800, color: '#111' }}>{t.title}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
