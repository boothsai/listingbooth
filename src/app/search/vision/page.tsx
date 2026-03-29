import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );
}

export default async function VisionSearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || '';
  const supabase = getSupabase();

  // Wired-First Doctrine: Query the core_logic schema directly
  let dbQuery: any = supabase
    .schema('core_logic')
    .from('new_construction_projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (query) {
    // Basic text matching across multiple fields to simulate the 'Vibe' retrieval
    // In production, this would hit pgvector or a specialized edge function
    dbQuery = dbQuery.or(`name.ilike.%${query}%,city.ilike.%${query}%,property_type.ilike.%${query}%,description.ilike.%${query}%`);
  }

  const { data: projects, error } = await dbQuery.limit(24);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', paddingTop: '100px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 16px' }}>
            Vision AI Results
          </h1>
          <p style={{ fontSize: '20px', color: '#666', margin: 0 }}>
            {query ? (
              <>Showing pre-construction assets matching: <strong style={{ color: '#111' }}>"{query}"</strong></>
            ) : (
              'Showing all latest absolute pre-construction inventory.'
            )}
          </p>
        </div>

        {error && (
          <div style={{ padding: '24px', background: '#fee2e2', color: '#991b1b', borderRadius: '12px', fontWeight: 600 }}>
            Database Connection Error: {error.message}
          </div>
        )}

        {!error && projects && projects.length === 0 && (
          <div style={{ padding: '64px 24px', background: 'white', borderRadius: '24px', textAlign: 'center', border: '1px solid #eaeaea' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 12px' }}>Zero Matches Detected</h3>
            <p style={{ color: '#666', fontSize: '18px', maxWidth: '500px', margin: '0 auto' }}>
              The central ledger returned no structural assets matching your exact specific aesthetic query. 
            </p>
            <Link href="/" style={{
              display: 'inline-flex', marginTop: '24px', padding: '12px 32px',
              background: '#111', color: 'white', borderRadius: '100px',
              textDecoration: 'none', fontWeight: 700
            }}>
              Return to Master Index
            </Link>
          </div>
        )}

        {projects && projects.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '32px' 
          }}>
            {projects.map((project: any) => (
              <Link key={project.id || project.slug} href={`/project/${project.slug || project.id}`} style={{
                display: 'block', textDecoration: 'none', color: 'inherit',
                background: 'white', borderRadius: '20px', overflow: 'hidden',
                border: '1px solid #eaeaea', transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              className="vision-card"
              >
                <div style={{
                  height: '240px', width: '100%',
                  background: `url(${project.main_image_url || project.photo_url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800'}) center/cover`
                }} />
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#da291c' }}>
                      {project.status || 'Active'}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#666' }}>
                      {project.city || 'Ottawa'}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    {project.name || project.title}
                  </h2>
                  <p style={{ fontSize: '16px', color: '#666', margin: 0, fontWeight: 500 }}>
                    {project.property_type || 'Pre-Construction Development'}
                  </p>
                  {project.price_from && (
                    <div style={{ marginTop: '16px', fontSize: '18px', fontWeight: 800 }}>
                      From ${project.price_from.toLocaleString()}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
        
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .vision-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }
      `}} />
    </div>
  );
}
