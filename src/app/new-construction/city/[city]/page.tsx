import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import MapLoader from '@/components/MapLoader';

export const revalidate = 3600; // Cache and regenerate hourly for optimal speed

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!,
    { cookies: { getAll() { return []; }, setAll() {} } }
  );
}

function formatCityName(slug: string) {
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export default async function CitySiloPage({ params }: { params: Promise<{ city: string }> }) {
  const resolvedParams = await params;
  const cityName = formatCityName(resolvedParams.city);
  const supabase = getSupabase();

  const { data, error } = await supabase
    .schema('core_logic')
    .from('builder_communities')
    .select('*, builders(name, trust_score), builder_products(price_from)')
    // We use ilike because database might store 'Ottawa' or 'ottawa'
    .ilike('city', cityName)
    .order('created_at', { ascending: false });

  const projects = (data || []).map((c: any) => {
    const prices = (c.builder_products || []).map((p: any) => p.price_from).filter(Boolean);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    return {
      slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: c.name,
      builder: c.builders?.name || 'Unknown Builder',
      trust_score: c.builders?.trust_score || null,
      city: c.city,
      price_from: minPrice,
      property_type: 'Master-Planned Community',
      status: c.status || 'Pre-Construction',
      color: '#111',
      description: `Premium new construction community by ${c.builders?.name || 'Unknown Builder'} located in ${c.city}.`,
      total_units: prices.length || 0,
      photo_url: c.hero_image_url
    };
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#888' }}>
          <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/new-construction" style={{ color: '#888', textDecoration: 'none' }}>New Construction</Link>
          <span>›</span>
          <span style={{ color: '#111' }}>{cityName}</span>
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: '#111', letterSpacing: '-2px', lineHeight: 1.1 }}>
          New Homes in {cityName}
        </h1>
        <p style={{ margin: 0, fontSize: '18px', color: '#888', fontWeight: 500 }}>
          Tracking {projects.length} VIP-access projects currently in development across {cityName}.
        </p>
      </div>

      {/* Map Hero */}
      {projects.length > 0 && (
        <div style={{ height: '500px', width: '100%', borderRadius: '24px', overflow: 'hidden', marginBottom: '40px', border: '1.5px solid #eee', position: 'relative', background: '#111' }}>
          <MapLoader projects={projects} />
          <div style={{ position: 'absolute', top: '24px', left: '80px', zIndex: 1000, background: 'rgba(17,17,17,0.85)', backdropFilter: 'blur(12px)', color: 'white', padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
              Live Radar Active
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.5px' }}>
              {cityName} Local Authority
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {projects.length === 0 ? (
        <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '20px', border: '1.5px solid #eee' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>🏗️</p>
          <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 900, color: '#111' }}>No inventory in {cityName} yet.</h3>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#666' }}>VABOT hasn't stealth-scraped any active projects here yet.</p>
          <Link href="/new-construction" style={{ background: '#da291c', color: 'white', padding: '12px 24px', borderRadius: '100px', fontSize: '14px', fontWeight: 800, textDecoration: 'none' }}>
            View All Ontario Projects
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {projects.map(p => (
            <Link key={p.slug} href={`/new-construction/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }} className="group">
              <div 
                className="bg-white transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)]"
                style={{ borderRadius: '20px', overflow: 'hidden', border: '1.5px solid #eee', cursor: 'pointer' }}
              >
                <div style={{ height: '200px', background: p.photo_url ? `url(${p.photo_url}) center/cover` : `linear-gradient(135deg, ${p.color} 0%, ${p.color}88 50%, ${p.color}33 100%)`, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                  <div style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '4px 12px', borderRadius: '100px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: 'white', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {p.status}
                  </div>
                  <div style={{ fontSize: '48px', opacity: 0.2, position: 'absolute', bottom: '16px', right: '20px' }}>🏗️</div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>{p.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>by {p.builder}</p>
                      {p.trust_score && p.trust_score >= 90 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: 800, border: '1px solid rgba(16,185,129,0.2)' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                          BUILDER SCORE {p.trust_score}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <p style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>From ${p.price_from?.toLocaleString()}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                     <span style={{ fontSize: '12px', fontWeight: 700, color: '#555', padding: '4px 10px', background: '#f5f5f5', borderRadius: '100px' }}>📍 {p.city}</span>
                     <span style={{ fontSize: '12px', fontWeight: 700, color: '#555', padding: '4px 10px', background: '#f5f5f5', borderRadius: '100px' }}>{p.property_type}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
