'use client';

export default function PlatformSection() {
  return (
    <section id="platform" style={{ backgroundColor: '#0a0a0a', padding: '80px 0', borderTop: '1px solid #1a1a1a' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }}>
          {/* Left */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '100px', border: '1px solid rgba(218,41,28,0.3)', background: 'rgba(218,41,28,0.08)', marginBottom: '24px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#da291c', display: 'block' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#da291c', textTransform: 'uppercase', letterSpacing: '0.1em' }}>BOOTHS.AI Satellite</span>
            </div>
            <h2 style={{ margin: '0 0 20px', fontSize: '42px', fontWeight: 900, letterSpacing: '-1.5px', color: 'white', lineHeight: 1.0 }}>
              Built For Buyers.<br />
              <span style={{ color: '#da291c' }}>Powered By AI.</span>
            </h2>
            <p style={{ margin: '0 0 40px', fontSize: '17px', color: '#888', lineHeight: 1.7, maxWidth: '460px' }}>
              ListingBooth is built directly on the BOOTHS.AI Mothership — connecting you instantly with elite local agents using real-time market intelligence and autonomous AI matchmaking.
            </p>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
              {[
                { title: 'Expert Agent Matching', desc: 'Our AI analyzes your needs to instantly match you with a top-performing eXp Realty agent in your specific neighborhood.', icon: '🎯' },
                { title: '24/7 AI Concierge', desc: 'Our VABOT handles your initial questions and securely books your showings instantly, anytime.', icon: '🤖' },
                { title: 'Live MLS® Data', desc: 'Full CREA DDF integration guarantees you see every listing across Canada with sub-100ms latency.', icon: '⚡' },
                { title: 'Priority Route Access', desc: 'Skip the line. Our system routes your inquiry directly to an agent priority inbox for guaranteed 5-minute response times.', icon: '🚀' },
                { title: 'Premium Showing Experience', desc: "Receive beautiful, interactive property data packages before you even step foot in the home.", icon: '📊' },
              ].map(f => (
                <div key={f.title} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{f.icon}</div>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: 'white' }}>{f.title}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: 1.5 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#agents" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#da291c', color: 'white', fontWeight: 800, fontSize: '15px', padding: '14px 32px', borderRadius: '8px', textDecoration: 'none', boxShadow: '0 4px 18px rgba(218,41,28,0.4)' }}>
                Find An Agent →
              </a>
              <a href="#map-search" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1.5px solid #333', color: '#ccc', fontWeight: 700, fontSize: '15px', padding: '14px 28px', borderRadius: '8px', textDecoration: 'none' }}>
                Browse Listings
              </a>
            </div>
          </div>

          {/* Right: stats + integrations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { value: '87ms', label: 'Search Speed', icon: '⚡' },
                { value: '99.9%', label: 'Platform Uptime', icon: '🟢' },
                { value: '3,200+', label: 'Elite Agents', icon: '👥' },
                { value: '140K+', label: 'Live Listings', icon: '🏠' },
              ].map(s => (
                <div key={s.label} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '10px' }}>{s.icon}</div>
                  <p style={{ margin: '0 0 4px', fontSize: '30px', fontWeight: 900, color: 'white', letterSpacing: '-1.5px' }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Integration logos box */}
            <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '28px' }}>
              <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Integrations & Compliance</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {['CREA DDF', 'MLS®', 'Supabase', 'Stripe', 'Twilio', 'FINTRAC'].map(brand => (
                  <div key={brand} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#888', letterSpacing: '0.05em' }}>{brand}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA banner */}
            <div style={{ background: 'linear-gradient(135deg, #da291c 0%, #8b1209 100%)', borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>Ready to find your home?</p>
              <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}>Connect with a top eXp Realty agent today.</p>
              <a href="#agents" style={{ background: 'white', color: '#da291c', fontWeight: 800, fontSize: '14px', padding: '10px 28px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' }}>
                Get Started →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
