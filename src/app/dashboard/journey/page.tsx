'use client';

const STAGES = [
  { key: 'searching', label: 'Searching', icon: '🔍', description: 'Browsing listings and saving favorites', color: '#2563eb' },
  { key: 'touring', label: 'Touring', icon: '🏠', description: 'Visiting properties and attending open houses', color: '#7c3aed' },
  { key: 'offer', label: 'Offer', icon: '📝', description: 'Terms negotiated and offer submitted', color: '#f59e0b' },
  { key: 'negotiation', label: 'Negotiation', icon: '🤝', description: 'Counter-offers and conditions under review', color: '#ea580c' },
  { key: 'conditional', label: 'Conditional Sale', icon: '📋', description: 'Home inspection, financing, and conditions period', color: '#059669' },
  { key: 'sold_firm', label: 'Sold Firm', icon: '✅', description: 'All conditions waived — the deal is firm!', color: '#16a34a' },
  { key: 'closing', label: 'Closing', icon: '🏦', description: 'Lawyers, title transfer, and final walkthrough', color: '#0891b2' },
  { key: 'keys', label: 'Keys! 🔑', icon: '🎉', description: 'Welcome home — you did it!', color: '#da291c' },
];

export default function JourneyPage() {
  // In production, this would fetch from /api/deals to show real transaction status
  // For now, show the timeline structure with the "Searching" stage active
  const currentStageIndex = 0; // "Searching" — represents a new buyer

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>My Journey</h2>
        <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>
          Track your home buying journey from first search to getting the keys.
        </p>
      </div>

      {/* Progress bar */}
      <div style={{
        padding: '24px 32px', borderRadius: '16px',
        background: 'white', border: '1.5px solid #eee', marginBottom: '32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
          {STAGES.map((stage, i) => (
            <div key={stage.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{
                height: '6px', width: '100%', borderRadius: '3px',
                background: i <= currentStageIndex ? stage.color : '#eee',
                transition: 'background 0.3s',
              }} />
              <span style={{
                fontSize: '10px', fontWeight: 800,
                color: i <= currentStageIndex ? stage.color : '#ccc',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                textAlign: 'center', lineHeight: 1.2,
              }}>
                {stage.label}
              </span>
            </div>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111', textAlign: 'center' }}>
          Current Stage: <span style={{ color: STAGES[currentStageIndex].color }}>{STAGES[currentStageIndex].label}</span>
        </p>
      </div>

      {/* Vertical timeline */}
      <div style={{ position: 'relative', paddingLeft: '48px' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute', left: '23px', top: '0', bottom: '0',
          width: '2px', background: '#eee',
        }} />

        {STAGES.map((stage, i) => {
          const isCompleted = i < currentStageIndex;
          const isCurrent = i === currentStageIndex;
          const isFuture = i > currentStageIndex;

          return (
            <div key={stage.key} style={{
              position: 'relative', marginBottom: '24px',
              opacity: isFuture ? 0.4 : 1,
              transition: 'opacity 0.3s',
            }}>
              {/* Node */}
              <div style={{
                position: 'absolute', left: '-36px', top: '4px',
                width: '24px', height: '24px', borderRadius: '50%',
                background: isCompleted || isCurrent ? stage.color : 'white',
                border: `3px solid ${isCompleted || isCurrent ? stage.color : '#ddd'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', zIndex: 1,
              }}>
                {isCompleted && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
              </div>

              {/* Card */}
              <div style={{
                padding: '20px 24px', borderRadius: '16px',
                background: isCurrent ? 'white' : isFuture ? '#fafafa' : 'white',
                border: isCurrent ? `2px solid ${stage.color}` : '1.5px solid #eee',
                boxShadow: isCurrent ? `0 4px 16px ${stage.color}20` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '20px' }}>{stage.icon}</span>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: isCompleted || isCurrent ? '#111' : '#999' }}>
                    {stage.label}
                  </h3>
                  {isCurrent && (
                    <span style={{
                      fontSize: '10px', fontWeight: 800, padding: '3px 10px',
                      borderRadius: '100px', background: `${stage.color}15`, color: stage.color,
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      You are here
                    </span>
                  )}
                  {isCompleted && (
                    <span style={{
                      fontSize: '10px', fontWeight: 800, padding: '3px 10px',
                      borderRadius: '100px', background: '#f0fdf4', color: '#16a34a',
                    }}>
                      Complete
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#888', fontWeight: 500 }}>
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
