'use client';

/**
 * Neighbourhood Intelligence Panel — 12-Tab Spatial Context Panel
 * Fetches data from /api/spatial and renders it in a premium tabbed interface.
 * 9 Public tabs + 3 Gated tabs (Phase P3)
 */

import { useEffect, useState } from 'react';

interface SchoolData {
  name: string;
  board: string;
  category: string;
  grades: string;
  distance_km: number;
  lat: number;
  lng: number;
}

interface TransitData {
  name: string;
  type: 'brt' | 'otrain' | 'lrt' | 'lrt_stage2';
  distance_km: number;
  lat: number;
  lng: number;
}

interface AmenityData {
  type: string;
  name: string;
  category: string;
  distance_km: number;
  lat: number;
  lng: number;
  details: { icon?: string };
}

interface SpatialData {
  zoning: {
    zone_code: string;
    zone_description: string;
    permitted_uses: string[];
    max_height: string | null;
    heritage_overlay: boolean;
    source: string;
  } | null;
  flood_risk: {
    in_flood_plain: boolean;
    flood_zone_type: string | null;
    risk_level: 'none' | 'low' | 'moderate' | 'high';
    source: string;
  } | null;
  schools: SchoolData[];
  demographics: {
    neighbourhood: string;
    ward: string;
    population: number | null;
    median_age: number | null;
    median_income: number | null;
    owner_pct: number | null;
    source: string;
  } | null;
  transit: TransitData[];
  amenities: AmenityData[];
  neighbourhood: string | null;
  ward: string | null;
}

interface Props {
  lat: number;
  lng: number;
  city?: string;
}

export default function NeighbourhoodIntelligence({ lat, lng, city }: Props) {
  const [data, setData] = useState<SpatialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('zoning');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lng) return;
    setLoading(true);
    fetch(`/api/spatial?type=full&lat=${lat}&lng=${lng}`)
      .then(r => r.json())
      .then(d => {
        setData(d.data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [lat, lng]);

  const tabs = [
    { key: 'zoning', label: 'Zoning', icon: '🏗️' },
    { key: 'flood', label: 'Flood Risk', icon: '🌊' },
    { key: 'schools', label: 'Schools', icon: '🎒' },
    { key: 'demographics', label: 'Demographics', icon: '👥' },
    { key: 'transit', label: 'Transit', icon: '🚆' },
    { key: 'amenities', label: 'Amenities', icon: '🌳' },
    { key: 'dev-apps', label: 'Dev Apps', icon: '🏗️', gated: true },
    { key: 'crime', label: 'Crime', icon: '🚨', gated: true },
    { key: 'permits', label: 'Permits', icon: '📤', gated: true },
  ];

  if (!lat || !lng) return null;

  return (
    <div style={{
      marginBottom: '40px',
      background: 'white',
      border: '1.5px solid #eee',
      borderRadius: '20px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 28px 0',
        borderBottom: '1px solid #f0f0f0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #da291c, #ff6b35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
          }}>📍</div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>
              Neighbourhood Intelligence
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#888', fontWeight: 500 }}>
              {data?.neighbourhood || city || 'Ottawa'} · Powered by Open Data
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2px',
          padding: '0 0 8px',
        }}>
          {tabs.map((tab, i) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 12px',
                background: activeTab === tab.key
                  ? tab.gated ? 'linear-gradient(135deg, #1a1a2e, #16213e)' : '#fff0ee'
                  : 'none',
                border: activeTab === tab.key
                  ? tab.gated ? '1.5px solid #333' : '1.5px solid #da291c'
                  : '1.5px solid transparent',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: activeTab === tab.key ? 800 : 600,
                color: activeTab === tab.key
                  ? tab.gated ? '#fff' : '#da291c'
                  : '#666',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '13px' }}>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.gated && <span style={{
                fontSize: '8px',
                background: activeTab === tab.key ? '#da291c' : 'linear-gradient(135deg, #111, #333)',
                padding: '1px 5px',
                borderRadius: '3px',
                color: '#fff',
                fontWeight: 800,
                letterSpacing: '0.5px',
              }}>PRO</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 28px', minHeight: '200px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
            <div style={{
              width: '24px', height: '24px', border: '3px solid #f0f0f0',
              borderTop: '3px solid #da291c', borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <p style={{ margin: 0, fontSize: '14px', color: '#888', fontWeight: 500 }}>Loading neighbourhood data...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <p style={{ color: '#da291c', fontSize: '14px' }}>Error loading data: {error}</p>
        ) : (
          <>
            {activeTab === 'zoning' && <ZoningPanel data={data?.zoning ?? null} />}
            {activeTab === 'flood' && <FloodRiskPanel data={data?.flood_risk ?? null} />}
            {activeTab === 'schools' && <SchoolsPanel schools={data?.schools || []} />}
            {activeTab === 'demographics' && <DemographicsPanel data={data?.demographics ?? null} />}
            {activeTab === 'transit' && <TransitPanel stations={data?.transit || []} />}
            {activeTab === 'amenities' && <AmenitiesPanel amenities={data?.amenities || []} />}
            {activeTab === 'dev-apps' && <DevAppsPanel lat={lat} lng={lng} />}
            {activeTab === 'crime' && <CrimePanel lat={lat} lng={lng} />}
            {activeTab === 'permits' && <PermitsPanel lat={lat} lng={lng} />}
          </>
        )}
      </div>

      {/* Attribution footer */}
      <div style={{
        padding: '12px 28px',
        borderTop: '1px solid #f5f5f5',
        background: '#fafafa',
      }}>
        <p style={{ margin: 0, fontSize: '10px', color: '#aaa', lineHeight: 1.5 }}>
          Source: City of Ottawa Open Data (open.ottawa.ca) · Statistics Canada, 2021 Census ·
          Data refreshed monthly. For official zoning decisions, consult the City of Ottawa.
        </p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Tab Panels
// ────────────────────────────────────────────────────────────

function ZoningPanel({ data }: { data: SpatialData['zoning'] }) {
  if (!data) return <EmptyState message="Zoning data not available for this location." />;

  return (
    <div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'flex-start' }}>
        <div style={{
          padding: '12px 20px',
          background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
          borderRadius: '12px',
          color: 'white',
          textAlign: 'center',
          minWidth: '80px',
        }}>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 900 }}>{data.zone_code.split('[')[0]}</p>
          <p style={{ margin: 0, fontSize: '10px', fontWeight: 600, opacity: 0.8 }}>Zone Code</p>
        </div>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: '#111' }}>
            {data.zone_description || 'Zoning By-law 2008-250'}
          </h3>
          {data.max_height && (
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#666' }}>
              Max Building Height: <strong>{data.max_height}</strong>
            </p>
          )}
          {data.heritage_overlay && (
            <span style={{
              display: 'inline-block',
              padding: '4px 10px',
              background: '#fef3c7',
              color: '#92400e',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
            }}>🏛️ Heritage Overlay</span>
          )}
        </div>
      </div>

      <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 800, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Permitted Uses
      </h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {data.permitted_uses.map((use, i) => (
          <span key={i} style={{
            padding: '6px 14px',
            background: '#f0fdf4',
            color: '#166534',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            border: '1px solid #bbf7d0',
          }}>✓ {use}</span>
        ))}
      </div>
    </div>
  );
}

function FloodRiskPanel({ data }: { data: SpatialData['flood_risk'] }) {
  if (!data) return <EmptyState message="Flood risk data not available for this location." />;

  const riskColors: Record<string, { bg: string; color: string; border: string }> = {
    none: { bg: '#f0fdf4', color: '#166534', border: '#86efac' },
    low: { bg: '#fefce8', color: '#854d0e', border: '#fde047' },
    moderate: { bg: '#fff7ed', color: '#9a3412', border: '#fdba74' },
    high: { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
  };

  const rc = riskColors[data.risk_level] || riskColors.none;

  return (
    <div>
      <div style={{
        padding: '20px 24px',
        background: rc.bg,
        border: `2px solid ${rc.border}`,
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '48px' }}>
          {data.risk_level === 'none' ? '✅' : data.risk_level === 'high' ? '🚨' : '⚠️'}
        </div>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 900, color: rc.color }}>
            {data.in_flood_plain ? 'In Flood Plain Zone' : 'Outside Flood Plain'}
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: rc.color, opacity: 0.8 }}>
            {data.in_flood_plain
              ? `This property is within a ${data.flood_zone_type || 'regulatory flood plain'}. Flood insurance may be required.`
              : 'This property is not located within a mapped flood plain. Standard insurance rates apply.'}
          </p>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>
        {data.source}. For official determinations, contact the Rideau Valley Conservation Authority (RVCA).
      </p>
    </div>
  );
}

function SchoolsPanel({ schools }: { schools: SchoolData[] }) {
  if (schools.length === 0) return <EmptyState message="No schools found within 3km of this property." />;

  // Group by board
  const boards = [...new Set(schools.map(s => s.board))];

  return (
    <div>
      <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#666' }}>
        <strong>{schools.length}</strong> schools within 3km of this property
      </p>

      {boards.map(board => (
        <div key={board} style={{ marginBottom: '20px' }}>
          <h4 style={{
            margin: '0 0 10px',
            fontSize: '12px',
            fontWeight: 800,
            color: '#888',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: board.includes('Catholic') ? '#7c3aed' : board.includes('Public') || board.includes('OCDSB') ? '#2563eb' : '#059669',
            }} />
            {board || 'Other'}
          </h4>

          {schools.filter(s => s.board === board).slice(0, 5).map((school, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              borderRadius: '10px',
              background: i % 2 === 0 ? '#fafafa' : 'white',
              marginBottom: '4px',
            }}>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111' }}>{school.name}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>
                  {school.category}{school.grades ? ` · ${school.grades}` : ''}
                </p>
              </div>
              <div style={{
                padding: '4px 12px',
                background: '#f0f0f0',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#444',
                whiteSpace: 'nowrap',
              }}>
                {school.distance_km.toFixed(1)} km
              </div>
            </div>
          ))}
        </div>
      ))}

      <p style={{ margin: '12px 0 0', fontSize: '10px', color: '#aaa' }}>
        Source: City of Ottawa — Schools MapServer. Distance calculated as straight-line.
      </p>
    </div>
  );
}

function DemographicsPanel({ data }: { data: SpatialData['demographics'] }) {
  if (!data) return <EmptyState message="Demographic data not available for this location." />;

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '20px',
      }}>
        <StatCard label="Neighbourhood" value={data.neighbourhood || '—'} icon="🏘️" />
        <StatCard label="Ward" value={data.ward || '—'} icon="🗳️" />
        <StatCard label="Census Source" value="StatsCan 2021" icon="📊" />
      </div>

      <div style={{
        padding: '20px',
        background: '#f8fafc',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
      }}>
        <p style={{ margin: 0, fontSize: '13px', color: '#555', lineHeight: 1.7 }}>
          📈 <strong>Full Census demographics</strong> — including population, median income, age distribution, 
          education levels, and language breakdowns — will be available in the next update once StatsCan 2021 
          ward-level data is fully ingested.
        </p>
      </div>

      <p style={{ margin: '12px 0 0', fontSize: '10px', color: '#aaa' }}>
        {data.source}
      </p>
    </div>
  );
}

function TransitPanel({ stations }: { stations: TransitData[] }) {
  if (stations.length === 0) return <EmptyState message="No transit stations found within 3km of this property." />;

  const typeLabels: Record<string, { label: string; color: string; icon: string }> = {
    lrt: { label: 'LRT (Confederation Line)', color: '#dc2626', icon: '🚇' },
    otrain: { label: 'O-Train (Trillium Line)', color: '#16a34a', icon: '🚂' },
    brt: { label: 'BRT (Transitway)', color: '#2563eb', icon: '🚌' },
    lrt_stage2: { label: 'LRT Stage 2 (Planned)', color: '#9333ea', icon: '🔮' },
  };

  const types = [...new Set(stations.map(s => s.type))];

  return (
    <div>
      <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#666' }}>
        <strong>{stations.length}</strong> transit stations within 3km
      </p>

      {types.map(type => {
        const meta = typeLabels[type] || { label: type, color: '#666', icon: '🚏' };
        const typeStations = stations.filter(s => s.type === type);

        return (
          <div key={type} style={{ marginBottom: '20px' }}>
            <h4 style={{
              margin: '0 0 10px', fontSize: '12px', fontWeight: 800,
              color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: meta.color,
              }} />
              {meta.icon} {meta.label}
            </h4>

            {typeStations.slice(0, 6).map((station, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', borderRadius: '10px',
                background: i % 2 === 0 ? '#fafafa' : 'white', marginBottom: '4px',
              }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111' }}>
                  {station.name}
                </p>
                <div style={{
                  padding: '4px 12px', background: `${meta.color}15`,
                  borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                  color: meta.color, whiteSpace: 'nowrap',
                  border: `1px solid ${meta.color}30`,
                }}>
                  {station.distance_km.toFixed(1)} km
                </div>
              </div>
            ))}
          </div>
        );
      })}

      <p style={{ margin: '12px 0 0', fontSize: '10px', color: '#aaa' }}>
        Source: City of Ottawa — TransitServices & Rail Implementation Office
      </p>
    </div>
  );
}

function AmenitiesPanel({ amenities }: { amenities: AmenityData[] }) {
  if (amenities.length === 0) return <EmptyState message="No amenities found within 2km of this property." />;

  // Group by category
  const categories = [...new Set(amenities.map(a => a.category))];

  const catColors: Record<string, string> = {
    Parks: '#16a34a', Recreation: '#2563eb', Family: '#ec4899',
    Nature: '#0891b2', Pets: '#d97706', Sports: '#7c3aed',
    Community: '#059669',
  };

  return (
    <div>
      {/* Summary badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        {categories.map(cat => {
          const count = amenities.filter(a => a.category === cat).length;
          const color = catColors[cat] || '#666';
          return (
            <span key={cat} style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
              background: `${color}10`, color, border: `1px solid ${color}25`,
            }}>
              {count} {cat}
            </span>
          );
        })}
      </div>

      {categories.map(cat => {
        const items = amenities.filter(a => a.category === cat);
        const color = catColors[cat] || '#666';

        return (
          <div key={cat} style={{ marginBottom: '16px' }}>
            <h4 style={{
              margin: '0 0 8px', fontSize: '12px', fontWeight: 800,
              color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
              {cat}
            </h4>

            {items.slice(0, 5).map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 14px', borderRadius: '10px',
                background: i % 2 === 0 ? '#fafafa' : 'white', marginBottom: '3px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{item.details?.icon || '📍'}</span>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111' }}>{item.name}</p>
                </div>
                <div style={{
                  padding: '3px 10px', background: '#f0f0f0',
                  borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                  color: '#555', whiteSpace: 'nowrap',
                }}>
                  {item.distance_km.toFixed(1)} km
                </div>
              </div>
            ))}
            {items.length > 5 && (
              <p style={{ margin: '4px 0 0 26px', fontSize: '11px', color: '#999' }}>
                +{items.length - 5} more nearby
              </p>
            )}
          </div>
        );
      })}

      <p style={{ margin: '12px 0 0', fontSize: '10px', color: '#aaa' }}>
        Source: City of Ottawa — Parks Inventory & Recreation Services
      </p>
    </div>
  );
}

function GatedPanel() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '16px',
        filter: 'grayscale(30%)',
      }}>🔒</div>
      <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 900, color: '#111' }}>
        Premium Intelligence
      </h3>
      <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#666', maxWidth: '360px', lineHeight: 1.6 }}>
        Sign up for a free account to unlock Crime Statistics, Building Permits, and Development Applications data.
      </p>
      <a
        href="/?auth=1"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 28px',
          background: 'linear-gradient(135deg, #da291c, #ff4444)',
          color: 'white',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 800,
          textDecoration: 'none',
          boxShadow: '0 4px 16px rgba(218,41,28,0.3)',
          transition: 'transform 0.15s ease',
        }}
      >
        🔓 Sign Up Free
      </a>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div style={{
      padding: '16px',
      background: '#f8fafc',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 800, color: '#111' }}>{value}</p>
      <p style={{ margin: 0, fontSize: '10px', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '160px',
      color: '#888',
      fontSize: '14px',
    }}>
      {message}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// GATED PANELS (P3)
// ────────────────────────────────────────────────────────────

function useGatedFetch(type: string, lat: number, lng: number) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/spatial?type=${type}&lat=${lat}&lng=${lng}`)
      .then(r => {
        if (r.status === 401) { setIsLocked(true); return null; }
        if (!r.ok) throw new Error('Failed to load data');
        return r.json();
      })
      .then(d => { if (d) setItems(d.data || []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [type, lat, lng]);

  return { items, loading, isLocked, error };
}

function DevAppsPanel({ lat, lng }: { lat: number; lng: number }) {
  const { items: apps, loading, isLocked, error } = useGatedFetch('dev-apps', lat, lng);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Checking development pipelines...</div>;
  if (isLocked) return <GatedPanel />;
  if (error) return <EmptyState message={error} />;
  if (apps.length === 0) return <EmptyState message="No active development applications found within 1.5km." />;

  return (
    <div>
      <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#666' }}>
        <strong>{apps.length}</strong> active development applications within 1.5km
      </p>
      {apps.map((app, i) => (
        <div key={i} style={{
          padding: '12px 16px', borderRadius: '12px',
          background: i % 2 === 0 ? '#fafafa' : 'white', marginBottom: '8px',
          border: '1px solid #f0f0f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#111' }}>{app.app_type}</h4>
            <div style={{
              padding: '2px 8px', background: '#e0e7ff', color: '#4338ca',
              borderRadius: '6px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase'
            }}>{app.status}</div>
          </div>
          <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#555', lineHeight: 1.4 }}>
            {app.description || 'Application under review'}
          </p>
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#888', fontWeight: 500 }}>
            <span>📍 {app.address}</span>
            <span>⏱️ {app.distance_km.toFixed(1)} km</span>
            <span>📂 {app.app_number}</span>
          </div>
        </div>
      ))}
      <p style={{ margin: '12px 0 0', fontSize: '10px', color: '#aaa' }}>
        Source: City of Ottawa — Development Applications Registry
      </p>
    </div>
  );
}

function CrimePanel({ lat, lng }: { lat: number; lng: number }) {
  const { items: crimes, loading, isLocked, error } = useGatedFetch('crime', lat, lng);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Querying police records...</div>;
  if (isLocked) return <GatedPanel />;
  if (error) return <EmptyState message={error} />;
  if (crimes.length === 0) return <EmptyState message="No crime records found within 1.5km. This is a safe area!" />;

  // Group by offence type
  const grouped: Record<string, number> = {};
  for (const c of crimes) {
    const key = c.offence || 'Other';
    grouped[key] = (grouped[key] || 0) + 1;
  }
  const sortedTypes = Object.entries(grouped).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#666' }}>
        <strong>{crimes.length}</strong> crime occurrences within 1.5km
      </p>

      {/* Offence breakdown */}
      <div style={{ marginBottom: '20px' }}>
        {sortedTypes.slice(0, 8).map(([type, count], i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 14px', borderRadius: '8px',
            background: i % 2 === 0 ? '#fafafa' : 'white',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>{type}</span>
            <div style={{
              padding: '2px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 800,
              background: count > 5 ? '#fef2f2' : '#f0fdf4',
              color: count > 5 ? '#dc2626' : '#16a34a',
            }}>{count}</div>
          </div>
        ))}
      </div>

      {/* Recent incidents */}
      <h4 style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Recent Incidents
      </h4>
      {crimes.slice(0, 5).map((c, i) => (
        <div key={i} style={{
          padding: '10px 14px', borderRadius: '10px',
          background: '#fafafa', marginBottom: '6px',
          borderLeft: '3px solid #dc2626'
        }}>
          <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#111' }}>{c.offence}</p>
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#888' }}>
            <span>📍 {c.road_name || c.community}</span>
            <span>⏱️ {c.distance_km.toFixed(1)} km</span>
          </div>
        </div>
      ))}

      <p style={{ margin: '12px 0 0', fontSize: '10px', color: '#aaa' }}>
        Source: Ottawa Police Service — Crime Locations Dataset
      </p>
    </div>
  );
}

function PermitsPanel({ lat, lng }: { lat: number; lng: number }) {
  const { items: permits, loading, isLocked, error } = useGatedFetch('building-permits', lat, lng);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Scanning construction forecasts...</div>;
  if (isLocked) return <GatedPanel />;
  if (error) return <EmptyState message={error} />;
  if (permits.length === 0) return <EmptyState message="No active construction or permits found within 2km." />;

  return (
    <div>
      <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#666' }}>
        <strong>{permits.length}</strong> active construction projects within 2km
      </p>

      {permits.map((p, i) => (
        <div key={i} style={{
          padding: '12px 16px', borderRadius: '12px',
          background: i % 2 === 0 ? '#fafafa' : 'white', marginBottom: '8px',
          border: '1px solid #f0f0f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#111', flex: 1, paddingRight: '12px' }}>
              {p.description}
            </h4>
            {p.status && (
              <div style={{
                padding: '2px 8px', background: '#fef3c7', color: '#d97706',
                borderRadius: '6px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
                whiteSpace: 'nowrap'
              }}>{p.status}</div>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '11px', color: '#888', fontWeight: 500 }}>
            {p.road_name && <span>🛣️ {p.road_name}</span>}
            {p.ward && <span>🗳️ {p.ward}</span>}
            <span>⏱️ {p.distance_km.toFixed(1)} km</span>
            {p.project_type && <span>🔧 {p.project_type}</span>}
          </div>
        </div>
      ))}

      <p style={{ margin: '12px 0 0', fontSize: '10px', color: '#aaa' }}>
        Source: City of Ottawa — Construction Forecast Data
      </p>
    </div>
  );
}
