'use client';

export default function VisionAIFeatures() {
  const features = [
    {
      title: "Aesthetic Vibe Scoring",
      desc: "Stop reading generic descriptions. Our Vision AI scans every listing image and scores the property on over 40 aesthetic dimensions—from Mid-Century Modern to Brutalist, Turn-Key to Gut Job.",
      icon: "🎨",
      color: "#da291c"
    },
    {
      title: "Hyper-Granular Extraction",
      desc: "If it's in the photo, our AI knows it. We instantly extract features agents forget to write: subzero fridges, quartz counters, herringbone floors, and exact window-to-wall ratios.",
      icon: "🔬",
      color: "#2563eb"
    },
    {
      title: "Visual Similarity Match",
      desc: "Found the perfect kitchen but the wrong neighborhood? Click 'Find Similar' and our vector database will instantly match the exact architectural vibe across the entire MLS.",
      icon: "📸",
      color: "#7c3aed"
    }
  ];

  return (
    <section style={{ padding: '120px 5%', background: '#111', color: 'white' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '80px', flexWrap: 'wrap', gap: '40px' }}>
          <div style={{ maxWidth: '700px' }}>
            <h2 style={{ fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 900, margin: '0 0 24px', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              Our Unfair Advantage:<br/>
              <span style={{ color: '#888' }}>Pixel-Perfect Intelligence.</span>
            </h2>
            <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
              ListingBooth runs a proprietary bare-metal GPU cluster that looks at real estate the way humans do. We don't rely on agent descriptions—we analyze the actual physics of the home.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '64px', fontWeight: 900, color: 'white', lineHeight: 1 }}>1.2B+</div>
            <div style={{ fontSize: '16px', color: '#da291c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Images Analyzed</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
          {features.map((f, i) => (
            <div key={i} style={{ 
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: '32px', 
              padding: '48px',
              border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '24px', 
                background: `${f.color}22`, color: f.color, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: '32px', marginBottom: '32px'
              }}>
                {f.icon}
              </div>
              
              <h3 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-0.5px' }}>{f.title}</h3>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{f.desc}</p>
              
              {/* Abstract decorative element */}
              <div style={{ 
                position: 'absolute', bottom: '-40px', right: '-40px', 
                width: '200px', height: '200px', borderRadius: '50%',
                background: `radial-gradient(circle, ${f.color}22 0%, transparent 70%)`
              }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
