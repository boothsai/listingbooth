'use client';
import Link from 'next/link';

export default function AestheticSeoGrid() {
  const cards = [
    {
      title: "Turn-Key Condos with Floor-to-Ceiling Windows",
      slug: "turn-key-condos-floor-to-ceiling-windows",
      img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
      count: 243,
      colSpan: 2
    },
    {
      title: "Move-in Ready Bungalows with Hardwood",
      slug: "move-in-ready-bungalows-hardwood",
      img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
      count: 112,
      colSpan: 1
    },
    {
      title: "Flipper Specials in Ottawa",
      slug: "flipper-specials-ottawa",
      img: "https://images.unsplash.com/photo-1583847268964-b28e50b58b34?auto=format&fit=crop&q=80&w=800",
      count: 89,
      colSpan: 1
    },
    {
      title: "Houses Backing Onto Ravines",
      slug: "houses-backing-onto-ravine",
      img: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&q=80&w=800",
      count: 156,
      colSpan: 2
    },
    {
      title: "Mid-Century Modern Architecture",
      slug: "mid-century-modern-architecture",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
      count: 42,
      colSpan: 1
    },
    {
      title: "Chef's Kitchens with Waterfall Islands",
      slug: "chefs-kitchens-waterfall-islands",
      img: "https://images.unsplash.com/photo-1556910103-1c02745a8728?auto=format&fit=crop&q=80&w=800",
      count: 318,
      colSpan: 2
    }
  ];

  return (
    <section style={{ padding: '120px 5%', background: '#fff' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 900, margin: '0 0 16px', color: '#111', letterSpacing: '-0.04em' }}>
            Search by Aesthetic & Vibe
          </h2>
          <p style={{ fontSize: '20px', color: '#666', margin: '0 auto', maxWidth: '700px', fontWeight: 500, lineHeight: 1.5 }}>
            Our vision models process millions of properties daily. We've curated the most sought-after aesthetics so you don't have to scroll blindly.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '24px',
          gridAutoRows: '340px'
        }}>
          {cards.map((card, i) => (
            <Link key={i} href={`/search/vibe/${card.slug}`} style={{
              display: 'block',
              textDecoration: 'none',
              borderRadius: '24px',
              overflow: 'hidden',
              position: 'relative',
              gridColumn: `span ${card.colSpan}`,
              border: '1px solid #eee'
            }}>
              {/* Background Image */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: `url(${card.img}) center/cover`,
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
                  {card.count} Active Listings
                </div>
                <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.5px' }}>
                  {card.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '64px' }}>
          <Link href="/search/vibes" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '16px 40px', background: '#111', color: 'white',
            borderRadius: '100px', fontSize: '16px', fontWeight: 800,
            textDecoration: 'none', transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#da291c'}
          onMouseLeave={e => e.currentTarget.style.background = '#111'}>
            Explore All 40+ Aesthetics
          </Link>
        </div>

      </div>
    </section>
  );
}
