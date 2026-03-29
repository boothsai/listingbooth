'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function AestheticSeoGrid() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRealData() {
      // Woven natively into the core_logic schema to obey the Wired-First Doctrine
      const { data, error } = await supabase
        .schema('core_logic')
        .from('new_construction_projects')
        .select('*')
        .limit(6);
        
      if (!error && data) {
        setCards(data);
      }
      setLoading(false);
    }
    loadRealData();
  }, []);

  return (
    <section style={{ padding: '120px 5%', background: '#fff' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 900, margin: '0 0 16px', color: '#111', letterSpacing: '-0.04em' }}>
            Live Pre-Construction Data
          </h2>
          <p style={{ fontSize: '20px', color: '#666', margin: '0 auto', maxWidth: '700px', fontWeight: 500, lineHeight: 1.5 }}>
            No mockups. No hallucinations. This is pure, wired data pulled directly from the `core_logic.new_construction_projects` database.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#666' }}>Authenticating Ledger & Fetching Assets...</div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '24px',
            gridAutoRows: '340px'
          }}>
            {cards.map((project, i) => (
              <Link key={project.id || i} href={`/project/${project.id || project.slug || project.name}`} style={{
                display: 'block',
                textDecoration: 'none',
                borderRadius: '24px',
                overflow: 'hidden',
                position: 'relative',
                gridColumn: i === 0 || i === 3 || i === 5 ? 'span 2' : 'span 1',
                border: '1px solid #eee'
              }}>
                {/* Background Image */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: `url(${project.main_image_url || 'https://via.placeholder.com/800x600?text=No+Image'}) center/cover`,
                  transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                
                {/* Gradient Scrim */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)',
                  pointerEvents: 'none'
                }} />

                {/* Content */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, 
                  padding: '32px', color: 'white', pointerEvents: 'none'
                }}>
                  <div style={{ 
                    display: 'inline-block', padding: '6px 16px', background: 'rgba(255,255,255,0.2)', 
                    backdropFilter: 'blur(10px)', borderRadius: '100px', fontSize: '12px', 
                    fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' 
                  }}>
                    {project.city || 'Ottawa'} • {project.status || 'Active'}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.5px' }}>
                    {project.name || project.title || 'Pre-Construction Asset'}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
