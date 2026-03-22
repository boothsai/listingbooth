'use client';

const agents = [
  { name: 'Sarah Mahmoud', title: 'Luxury Specialist', city: 'Ottawa', deals: 142, rating: 4.9, languages: ['EN', 'AR'], initials: 'SM', color: '#da291c' },
  { name: 'James Park', title: 'First-Time Buyer Expert', city: 'Toronto', deals: 89, rating: 4.8, languages: ['EN', 'KR'], initials: 'JP', color: '#1d4ed8' },
  { name: 'Aisha Tremblay', title: 'Investment & Multi-Unit', city: 'Montreal', deals: 211, rating: 5.0, languages: ['EN', 'FR'], initials: 'AT', color: '#059669' },
  { name: 'Carlos Rivera', title: 'Condo Market Expert', city: 'Vancouver', deals: 178, rating: 4.9, languages: ['EN', 'ES'], initials: 'CR', color: '#7c3aed' },
  { name: 'Priya Sharma', title: 'Pre-Construction Specialist', city: 'Mississauga', deals: 94, rating: 4.8, languages: ['EN', 'HI'], initials: 'PS', color: '#b45309' },
  { name: 'Michael Dubois', title: 'Waterfront & Rural', city: 'Kingston', deals: 67, rating: 4.7, languages: ['EN', 'FR'], initials: 'MD', color: '#0e7490' },
];

export default function AgentsSection() {
  return (
    <section id="agents" style={{ backgroundColor: '#fff', padding: '80px 0', borderTop: '1px solid #f0f0f0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: '#da291c', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Expert Agents</p>
            <h2 style={{ margin: '0 0 12px', fontSize: '42px', fontWeight: 900, letterSpacing: '-1.5px', color: '#111', lineHeight: 1.0 }}>Top Producers. Zero Guesswork.</h2>
            <p style={{ margin: 0, fontSize: '17px', color: '#666', maxWidth: '520px', lineHeight: 1.6 }}>
              Hand-selected agents with verified performance data. No cold calls, no pressure — just results.
            </p>
          </div>
          {/* Filter row */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['All Cities', 'Ottawa', 'Toronto', 'Vancouver', 'Montreal'].map((c, i) => (
              <button key={c} style={{
                padding: '8px 16px', borderRadius: '100px',
                border: i === 0 ? '2px solid #da291c' : '1.5px solid #e5e5e5',
                background: i === 0 ? '#da291c' : 'white',
                color: i === 0 ? 'white' : '#555',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              }}>{c}</button>
            ))}
          </div>
        </div>

        {/* Agent cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {agents.map(a => (
            <div key={a.name} style={{
              background: 'white', borderRadius: '16px', border: '1.5px solid #eee', padding: '28px',
              transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s cubic-bezier(0.16,1,0.3,1)',
              cursor: 'pointer',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                {/* Avatar */}
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '18px', flexShrink: 0 }}>
                  {a.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 2px', fontSize: '17px', fontWeight: 800, color: '#111' }}>{a.name}</p>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#888' }}>{a.title}</p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {a.languages.map(l => (
                      <span key={l} style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#f5f5f5', color: '#555' }}>{l}</span>
                    ))}
                  </div>
                </div>
                {/* Rating */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: 900, color: '#111' }}>{a.rating}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#f59e0b' }}>{'★'.repeat(5)}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', padding: '16px 0', borderTop: '1px solid #f5f5f5', borderBottom: '1px solid #f5f5f5', marginBottom: '20px' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <p style={{ margin: '0 0 2px', fontSize: '22px', fontWeight: 900, color: '#111' }}>{a.deals}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deals Closed</p>
                </div>
                <div style={{ width: '1px', background: '#f0f0f0' }} />
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <p style={{ margin: '0 0 2px', fontSize: '22px', fontWeight: 900, color: '#111' }}>{a.city}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Primary Market</p>
                </div>
              </div>

              <button style={{
                width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #e5e5e5',
                background: 'white', color: '#111', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#da291c'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#da291c'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#111'; e.currentTarget.style.borderColor = '#e5e5e5'; }}
              >
                Request Introduction →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
