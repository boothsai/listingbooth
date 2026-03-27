'use client';

export default function WhyListingBooth() {
  return (
    <section style={{ padding: '120px 5%', backgroundColor: '#fff', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Decorative Grid */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundSize: '100px 100px', backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)', zIndex: 0 }} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px', maxWidth: '800px', margin: '0 auto 80px' }}>
          <div style={{ 
            display: 'inline-flex', padding: '6px 12px', borderRadius: '4px', 
            background: 'rgba(218,41,28,0.05)', color: '#da291c', fontWeight: 800, 
            fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px'
          }}>
            The ListingBooth Advantage
          </div>
          <h2 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 900, margin: '0 0 24px', letterSpacing: '-0.04em', lineHeight: 1.05, color: '#111' }}>
            Built for buyers who expect <br/><span style={{ color: '#da291c' }}>more than just search.</span>
          </h2>
          <p style={{ fontSize: '20px', color: '#666', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
            Standard portals are built on decade-old architecture. ListingBooth is the first Consumer Real Estate OS powered by Vision AI, unlocking institutional-grade data for everyone.
          </p>
        </div>

        {/* Bento Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', gridAutoRows: 'minmax(340px, auto)' }}>
          
          {/* Card 1: Natural Language AI (Spans 8) */}
          <div style={{ 
            gridColumn: 'span 8', background: '#fafafa', borderRadius: '32px', 
            border: '1px solid #eee', overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '48px 48px 0', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#da291c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#111', margin: 0 }}>Natural Language Search</h3>
              </div>
              <p style={{ fontSize: '18px', color: '#555', margin: '0 0 32px', lineHeight: 1.5, maxWidth: '500px' }}>
                Just describe your perfect home exactly how you think of it. Our AI parses the nuance and instantly cross-references the MLS to find it.
              </p>
            </div>
            
            {/* Visual Chat Mockup */}
            <div style={{ background: '#f0f0f0', borderTop: '1px solid #e5e5e5', padding: '32px', flexShrink: 0 }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '20px 20px 0 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', maxWidth: '80%', marginLeft: 'auto', marginBottom: '16px' }}>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111', lineHeight: 1.4 }}>
                  "Find me a modernist glass house in Oakville under $2.5M. It must have a pool and back onto a ravine."
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#111', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✨</div>
                <div style={{ background: '#111', padding: '20px', borderRadius: '0 20px 20px 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flex: 1 }}>
                  <p style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 600, color: 'white', lineHeight: 1.4 }}>
                    Analyzed 12,408 Oakville listings. Found 3 perfect matches matching "modernist glass", "ravine lot", and "pool".
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ height: '60px', flex: 1, borderRadius: '8px', background: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=400") center/cover', border: '1px solid rgba(255,255,255,0.2)' }} />
                    <div style={{ height: '60px', flex: 1, borderRadius: '8px', background: 'url("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400") center/cover', border: '1px solid rgba(255,255,255,0.2)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Sold Data (Spans 4) */}
          <div style={{ 
            gridColumn: 'span 4', background: '#fafafa', borderRadius: '32px', 
            border: '1px solid #eee', padding: '48px', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#111', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#111', margin: '0 0 16px' }}>Absolute Transparency</h3>
            <p style={{ fontSize: '16px', color: '#666', margin: '0 0 32px', lineHeight: 1.6 }}>
              Unlock the data that other portals hide behind paywalls. We provide full access to historical sold prices, days on market, and property tax records instantly.
            </p>
            <div style={{ marginTop: 'auto', background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #eee', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: '#888', fontWeight: 600 }}>Sold Price (Oct 2023)</span>
                <span style={{ fontSize: '14px', color: '#111', fontWeight: 800 }}>$1,425,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#888', fontWeight: 600 }}>Sold Price (May 2019)</span>
                <span style={{ fontSize: '14px', color: '#111', fontWeight: 800 }}>$950,000</span>
              </div>
            </div>
          </div>

          {/* Comparison Callout (Spans 12) */}
          <div style={{ 
            gridColumn: 'span 12', 
            background: 'linear-gradient(135deg, #da291c 0%, #b81e13 100%)', 
            borderRadius: '32px', padding: '64px', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px',
            position: 'relative', overflow: 'hidden'
          }}>
            {/* Ambient Lighting in the callout */}
            <div style={{ position: 'absolute', top: 0, right: '0', width: '50%', height: '100%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', zIndex: 0 }} />

            <div style={{ flex: '1', minWidth: '400px', position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'inline-flex', padding: '6px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: '100px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '24px' }}>
                HOW WE COMPARE
              </div>
              <h3 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, margin: '0', lineHeight: 1.1, letterSpacing: '-1px' }}>
                Stop wrestling with 15 different filters just to find a decent home.
              </h3>
            </div>
            
            <div style={{ flex: '1', minWidth: '400px', position: 'relative', zIndex: 10 }}>
              <p style={{ fontSize: '20px', fontWeight: 500, margin: 0, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
                Realtor.ca makes you scroll through thousands of listings blindly. <strong style={{ color: 'white', fontWeight: 900 }}>ListingBooth's Natural Language Engine</strong> lets you simply describe your exact dream home, and our Vision AI instantly cross-references the entire MLS to find it for you—all in real-time, all for free.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
