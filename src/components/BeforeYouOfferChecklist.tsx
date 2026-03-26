'use client';

import { useState } from 'react';

const STEPS = [
  { id: 'pre-approval', icon: '🏦', title: 'Get Pre-Approved', desc: 'Speak with your bank or mortgage broker to understand your maximum budget. Most sellers won\'t entertain offers without pre-approval.', timing: '1–3 days' },
  { id: 'lawyer', icon: '⚖️', title: 'Retain a Real Estate Lawyer', desc: 'You\'ll need a lawyer for title search, closing documents, and trust account management. Budget $1,500–$2,500.', timing: '1 day' },
  { id: 'inspection', icon: '🔍', title: 'Schedule Home Inspection', desc: 'A certified inspector checks the foundation, roof, HVAC, plumbing, and electrical systems. This can save you from catastrophic surprises.', timing: '2–5 days' },
  { id: 'status-cert', icon: '📋', title: 'Request Status Certificate (Condos)', desc: 'If buying a condo, request the status certificate to review the condo corporation\'s financial health, reserve fund, and any pending litigation.', timing: '3–10 days' },
  { id: 'offer', icon: '📝', title: 'Draft Your Offer', desc: 'Work with your agent to submit a competitive offer. Include conditions (financing, inspection) and a deposit (typically 5% of purchase price).', timing: '1 day' },
  { id: 'negotiation', icon: '🤝', title: 'Negotiation & Acceptance', desc: 'The seller may counter-offer. Your agent handles negotiations. Once both parties sign, you have a binding Agreement of Purchase and Sale.', timing: '1–7 days' },
  { id: 'conditions', icon: '✅', title: 'Fulfill Conditions', desc: 'Complete your inspection, finalize financing with the bank, and review the status certificate. Remove conditions by the deadline in your offer.', timing: '5–15 days' },
  { id: 'closing', icon: '🔑', title: 'Closing Day', desc: 'Your lawyer transfers funds to the seller\'s lawyer. You receive the keys. Welcome home!', timing: '30–90 days from offer' },
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
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📋</div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#111' }}>Before You Offer</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#888', fontWeight: 600 }}>
              {completedSteps.length} of {STEPS.length} steps completed
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '80px', height: '6px', borderRadius: '100px', background: '#f0f0f0', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#22c55e', borderRadius: '100px', transition: 'width 0.4s ease-out' }} />
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
                  {/* Timeline line */}
                  {i < STEPS.length - 1 && (
                    <div style={{ position: 'absolute', left: '19px', top: '40px', width: '2px', height: 'calc(100% - 20px)', background: done ? '#22c55e' : '#eee' }} />
                  )}
                  
                  {/* Checkbox */}
                  <button onClick={() => toggleStep(step.id)} style={{ width: '40px', height: '40px', borderRadius: '50%', border: done ? 'none' : '2px solid #ddd', background: done ? '#22c55e' : 'white', color: done ? 'white' : '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s', zIndex: 1 }}>
                    {done ? '✓' : step.icon}
                  </button>

                  {/* Content */}
                  <div style={{ flex: 1, padding: '8px 0 28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: done ? '#22c55e' : '#111', textDecoration: done ? 'line-through' : 'none' }}>{step.title}</p>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#888', background: '#f5f5f5', padding: '4px 10px', borderRadius: '100px', whiteSpace: 'nowrap' }}>{step.timing}</span>
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#888', lineHeight: 1.6 }}>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}} />
    </div>
  );
}
