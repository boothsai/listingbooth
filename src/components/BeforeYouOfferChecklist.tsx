'use client';

import { useState } from 'react';

const STEPS = [
  { id: 'pre-approval', icon: '🏦', title: 'Get Pre-Approved', desc: 'Know your budget before you start looking. A mortgage pre-approval also tells sellers you\'re a serious buyer — most won\'t entertain offers without one.', timing: '1–3 days' },
  { id: 'comps', icon: '📊', title: 'Research Comparable Sales', desc: 'Check what similar homes in the area have actually sold for — not just listed prices. This gives you a realistic picture of market value and helps you avoid overpaying.', timing: '1 day' },
  { id: 'inspection', icon: '🔍', title: 'Book a Home Inspection', desc: 'A certified inspector checks the foundation, roof, HVAC, plumbing, and electrical for hidden issues. It\'s a small cost that can save you from expensive surprises down the road.', timing: '2–5 days' },
  { id: 'status-cert', icon: '📋', title: 'Review the Status Certificate', desc: 'Buying a condo? The status certificate reveals the corporation\'s financial health, reserve fund, and any pending lawsuits. It\'s the single most important document in a condo purchase.', timing: '3–10 days' },
  { id: 'offer', icon: '📝', title: 'Put Together Your Offer', desc: 'Your offer should include the right conditions (financing, inspection), an appropriate deposit — typically 5% of purchase price — and a well-researched price backed by comparables.', timing: '1 day' },
  { id: 'negotiation', icon: '🤝', title: 'Navigate the Negotiation', desc: 'Sellers often counter-offer. In a multiple-offer situation, strategy matters more than just price — closing date flexibility and clean conditions can make or break a deal.', timing: '1–7 days' },
  { id: 'conditions', icon: '✅', title: 'Fulfill Your Conditions', desc: 'Once your offer is accepted, the clock starts. Complete your inspection, lock in your financing, and review any condo documents before your condition deadlines expire.', timing: '5–15 days' },
  { id: 'closing', icon: '🔑', title: 'Closing Day', desc: 'Your lawyer handles the title transfer and funds. Do a final walkthrough to confirm the property is in the expected condition, then pick up your keys. You\'re home.', timing: '30–90 days' },
];

export default function BeforeYouOfferChecklist() {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  function toggleStep(id: string) {
    setCompletedSteps(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }

  const progress = (completedSteps.length / STEPS.length) * 100;

  return (
    <div style={{ background: 'white', border: '1.5px solid #eee', borderRadius: '16px', overflow: 'hidden' }}>
      <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(218,41,28,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📋</div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#111' }}>Before You Offer</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#888', fontWeight: 600 }}>
              {completedSteps.length} of {STEPS.length} steps completed
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '80px', height: '6px', borderRadius: '100px', background: '#f0f0f0', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#da291c', borderRadius: '100px', transition: 'width 0.4s ease-out' }} />
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0 24px 24px', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {STEPS.map((step, i) => {
              const done = completedSteps.includes(step.id);
              return (
                <div key={step.id} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  {i < STEPS.length - 1 && (
                    <div style={{ position: 'absolute', left: '19px', top: '40px', width: '2px', height: 'calc(100% - 20px)', background: done ? '#da291c' : '#eee' }} />
                  )}
                  
                  <button onClick={() => toggleStep(step.id)} style={{ width: '40px', height: '40px', borderRadius: '50%', border: done ? 'none' : '2px solid #ddd', background: done ? '#da291c' : 'white', color: done ? 'white' : '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s', zIndex: 1 }}>
                    {done ? '✓' : step.icon}
                  </button>

                  <div style={{ flex: 1, padding: '8px 0 28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: done ? '#da291c' : '#111', textDecoration: done ? 'line-through' : 'none' }}>{step.title}</p>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#888', background: '#f5f5f5', padding: '4px 10px', borderRadius: '100px', whiteSpace: 'nowrap' }}>{step.timing}</span>
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#666', lineHeight: 1.6 }}>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#999', textAlign: 'center', lineHeight: 1.5 }}>
            Have questions about any of these steps? <a href="/sell" style={{ color: '#da291c', fontWeight: 700, textDecoration: 'none' }}>We&apos;re happy to help.</a>
          </p>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}} />
    </div>
  );
}
