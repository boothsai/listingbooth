export default function WhyListingBooth() {
  const VALUE_PROPS = [
    {
      icon: '⚡',
      title: 'Real-Time MLS® Data',
      description: 'Connected directly to the CREA DDF® feed. Listings appear here the same minute they hit the MLS — not hours later like aggregate portals.',
      stat: '25,000+',
      statLabel: 'Active Listings',
    },
    {
      icon: '🧠',
      title: 'AI-Powered Insights',
      description: 'Gemini Vision AI analyzes every listing photo, neighborhood demographics, and market trends to surface insights no other portal offers.',
      stat: 'Instant',
      statLabel: 'AI Valuations',
    },
    {
      icon: '🔓',
      title: 'Full Market Transparency',
      description: 'Sold prices, days on market, price history — data that other portals hide behind paywalls, we give you for free.',
      stat: '4+ Years',
      statLabel: 'Historical Data',
    },
  ];

  return (
    <section style={{ padding: '80px 24px', backgroundColor: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 800, color: '#da291c', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            THE LISTINGBOOTH ADVANTAGE
          </p>
          <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, color: '#111', letterSpacing: '-2px', lineHeight: 1.1 }}>
            Why Buyers Choose Us
          </h2>
          <p style={{ margin: '0 auto', fontSize: '17px', color: '#666', maxWidth: '600px', lineHeight: 1.6 }}>
            ListingBooth isn&apos;t just another listings portal. It&apos;s the smarter way to buy and sell real estate — powered by AI infrastructure that the big portals can&apos;t match.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {VALUE_PROPS.map(v => (
            <div key={v.title} style={{
              borderRadius: '20px', padding: '40px 32px',
              background: '#fafafa', border: '1.5px solid #eee',
              textAlign: 'center', transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: '40px', marginBottom: '20px' }}>{v.icon}</div>
              <h3 style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>
                {v.title}
              </h3>
              <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#666', lineHeight: 1.6 }}>
                {v.description}
              </p>
              <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <p style={{ margin: '0 0 2px', fontSize: '32px', fontWeight: 900, color: '#da291c', letterSpacing: '-1px' }}>{v.stat}</p>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{v.statLabel}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison callout */}
        <div style={{
          marginTop: '48px', padding: '32px 40px', borderRadius: '20px',
          background: '#111', color: 'white', textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#888' }}>
            HOW WE COMPARE
          </p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'white', lineHeight: 1.5, maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
            Realtor.ca shows you listings. Zillow estimates. <span style={{ color: '#da291c' }}>ListingBooth</span> gives you real-time MLS data, AI valuations, sold price history, and neighborhood intelligence — all in one place, all for free.
          </p>
        </div>
      </div>
    </section>
  );
}
