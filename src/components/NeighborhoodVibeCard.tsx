import { getDemographics } from '@/lib/demographics';

export default function NeighborhoodVibeCard({ city, community }: { city?: string | null; community?: string | null }) {
  const slug = community || city || '';
  const data = getDemographics(slug);
  const displayName = data?.name || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'This Area');

  // Use real scores if available, otherwise show a placeholder state
  const vibes = data ? [
    { emoji: '🏪', label: 'Walkability',    score: data.walkScore },
    { emoji: '🎓', label: 'School Quality', score: data.schoolScore },
    { emoji: '🌳', label: 'Green Space',    score: data.greenScore },
    { emoji: '🚇', label: 'Transit Access', score: data.transitScore },
    { emoji: '🔇', label: 'Quiet Level',    score: data.quietScore },
    { emoji: '👨‍👩‍👧‍👦', label: 'Family Friendly', score: data.familyScore },
  ] : null;

  return (
    <div style={{ background: 'white', border: '1.5px solid #eee', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📍</div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#111' }}>Neighborhood Vibe</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#888', fontWeight: 600 }}>{displayName}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 24px 24px' }}>
        {vibes ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {vibes.map(v => (
                <div key={v.label} style={{ padding: '12px', background: '#f9f9f9', borderRadius: '10px', border: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#555' }}>{v.emoji} {v.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: v.score >= 80 ? '#22c55e' : v.score >= 60 ? '#f59e0b' : '#ef4444' }}>{v.score}</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: '#e5e5e5', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ width: `${v.score}%`, height: '100%', background: v.score >= 80 ? '#22c55e' : v.score >= 60 ? '#f59e0b' : '#ef4444', borderRadius: '100px', transition: 'width 0.6s ease-out' }} />
                  </div>
                </div>
              ))}
            </div>
            {data?.vibe && (
              <p style={{ margin: '16px 0 0', fontSize: '12px', color: '#888', lineHeight: 1.6, fontStyle: 'italic' }}>
                {data.vibe}
              </p>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0', color: '#aaa' }}>
            <p style={{ fontSize: '24px', margin: '0 0 8px' }}>🗺️</p>
            <p style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>Neighborhood data coming soon for {displayName || 'this area'}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
