'use client';

import { useState } from 'react';

interface TrueCostProps {
  listPrice: number;
  propertyTax?: number;
  condoFees?: number;
}

export default function TrueCostCalculator({ listPrice, propertyTax, condoFees }: TrueCostProps) {
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [rate, setRate] = useState(4.79);
  const [amortization, setAmortization] = useState(25);
  const [expanded, setExpanded] = useState(false);

  // Core calculations
  const downPayment = listPrice * (downPaymentPct / 100);
  const principal = listPrice - downPayment;
  const monthlyRate = rate / 100 / 12;
  const numPayments = amortization * 12;
  const mortgage = monthlyRate > 0 
    ? (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    : principal / numPayments;

  // Estimated monthly costs
  const estPropertyTax = propertyTax ? propertyTax / 12 : (listPrice * 0.011) / 12;
  const estInsurance = Math.max(80, listPrice * 0.0004);
  const estUtilities = listPrice > 1000000 ? 350 : listPrice > 500000 ? 250 : 180;
  const estMaintenance = listPrice * 0.01 / 12;
  const monthlyCondoFees = condoFees || 0;

  const totalMonthly = mortgage + estPropertyTax + estInsurance + estUtilities + estMaintenance + monthlyCondoFees;

  // Ontario Land Transfer Tax
  const ltt = (() => {
    let tax = 0;
    if (listPrice > 55000) tax += Math.min(listPrice, 250000) * 0.005;
    if (listPrice > 250000) tax += Math.min(listPrice - 250000, 150000) * 0.01;
    if (listPrice > 400000) tax += Math.min(listPrice - 400000, 1600000) * 0.015;
    if (listPrice > 2000000) tax += (listPrice - 2000000) * 0.02;
    return tax;
  })();

  const costItems = [
    { label: 'Mortgage', value: mortgage, color: '#da291c', pct: (mortgage / totalMonthly * 100) },
    { label: 'Property Tax', value: estPropertyTax, color: '#f59e0b', pct: (estPropertyTax / totalMonthly * 100) },
    { label: 'Insurance', value: estInsurance, color: '#3b82f6', pct: (estInsurance / totalMonthly * 100) },
    { label: 'Utilities', value: estUtilities, color: '#8b5cf6', pct: (estUtilities / totalMonthly * 100) },
    { label: 'Maintenance', value: estMaintenance, color: '#10b981', pct: (estMaintenance / totalMonthly * 100) },
    ...(monthlyCondoFees > 0 ? [{ label: 'Condo Fees', value: monthlyCondoFees, color: '#ec4899', pct: (monthlyCondoFees / totalMonthly * 100) }] : []),
  ];

  return (
    <div style={{ background: 'white', border: '1.5px solid #eee', borderRadius: '16px', overflow: 'hidden' }}>
      {/* Header */}
      <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(218,41,28,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💰</div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#111' }}>True Cost of Ownership</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#888', fontWeight: 600 }}>
              Est. <strong style={{ color: '#da291c', fontSize: '16px' }}>${Math.round(totalMonthly).toLocaleString()}</strong>/mo all-in
            </p>
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}><path d="m6 9 6 6 6-6"/></svg>
      </button>

      {expanded && (
        <div style={{ padding: '0 24px 24px', animation: 'fadeIn 0.3s ease-out' }}>
          {/* Stacked bar chart */}
          <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', height: '12px', marginBottom: '20px' }}>
            {costItems.map(c => (
              <div key={c.label} style={{ width: `${c.pct}%`, backgroundColor: c.color, transition: 'width 0.5s' }} title={`${c.label}: $${Math.round(c.value)}/mo`} />
            ))}
          </div>

          {/* Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {costItems.map(c => (
              <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: c.color }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>{c.label}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#111' }}>${Math.round(c.value).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '2px solid #111' }}>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#111' }}>Total Monthly</span>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#da291c' }}>${Math.round(totalMonthly).toLocaleString()}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ background: '#f9f9f9', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Down Payment</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#111' }}>{downPaymentPct}% (${Math.round(downPayment).toLocaleString()})</span>
              </div>
              <input type="range" min="5" max="50" value={downPaymentPct} onChange={e => setDownPaymentPct(Number(e.target.value))} style={{ width: '100%', accentColor: '#da291c' }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interest Rate</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#111' }}>{rate.toFixed(2)}%</span>
              </div>
              <input type="range" min="1" max="10" step="0.01" value={rate} onChange={e => setRate(Number(e.target.value))} style={{ width: '100%', accentColor: '#da291c' }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amortization</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#111' }}>{amortization} years</span>
              </div>
              <input type="range" min="10" max="30" value={amortization} onChange={e => setAmortization(Number(e.target.value))} style={{ width: '100%', accentColor: '#da291c' }} />
            </div>
          </div>

          {/* One-time costs */}
          <div style={{ marginTop: '20px', padding: '16px 20px', background: '#fef2f2', borderRadius: '10px', border: '1px solid rgba(218,41,28,0.1)' }}>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 800, color: '#da291c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>One-Time Closing Costs</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '4px' }}>
              <span>Ontario Land Transfer Tax</span>
              <span style={{ fontWeight: 800, color: '#111' }}>${Math.round(ltt).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555' }}>
              <span>Legal + Inspection (est.)</span>
              <span style={{ fontWeight: 800, color: '#111' }}>$3,500</span>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}} />
    </div>
  );
}
