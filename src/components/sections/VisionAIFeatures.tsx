'use client';

export default function VisionAIFeatures() {
  return (
    <section style={{ padding: '120px 5%', background: '#0a0a0a', color: 'white', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Ambient Glow */}
      <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(218,41,28,0.05) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '80px', maxWidth: '800px' }}>
          <div style={{ 
            display: 'inline-flex', padding: '6px 12px', borderRadius: '4px', 
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#da291c', fontWeight: 800, fontSize: '12px', letterSpacing: '0.15em',
            textTransform: 'uppercase', marginBottom: '24px'
          }}>
            Proprietary Architecture
          </div>
          <h2 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 900, margin: '0 0 32px', letterSpacing: '-0.04em', lineHeight: 1.05, color: 'white' }}>
            We don't search by keywords.<br/>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>We search by physics, light,<br/>and geometry.</span>
          </h2>
          <p style={{ fontSize: '22px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
            While outdated brokerages rely on lazy, inaccurate agent descriptions, ListingBooth's bare-metal GPU cluster analyzes the actual visual DNA of every property on the market.
          </p>
        </div>

        {/* Bento Box Layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(12, 1fr)', 
          gridAutoRows: '420px',
          gap: '24px' 
        }}>
          
          {/* Card 1: Aesthetic Vibe Matrix (Spans 8 cols) */}
          <div style={{ 
            gridColumn: 'span 8', 
            background: 'rgba(255,255,255,0.03)', borderRadius: '32px', 
            border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
            display: 'flex', position: 'relative',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02)'
          }}>
            {/* Visual Side */}
            <div style={{ flex: 1, position: 'relative', background: '#111', borderRight: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              {/* Fake Photo Scans */}
              <div style={{ position: 'absolute', top: '10%', left: '10%', right: '10%', bottom: '10%', borderRadius: '16px', background: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800") center/cover', opacity: 0.5 }} />
              
              {/* AI UI Overlay */}
              <div style={{ position: 'absolute', top: '20%', left: '-10%', right: '-10%', height: '2px', background: '#da291c', boxShadow: '0 0 20px #da291c', animation: 'scan 4s infinite linear' }} />
              
              <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.8)', border: '1px solid #da291c', color: '#da291c', borderRadius: '4px', fontSize: '11px', fontWeight: 800, backdropFilter: 'blur(4px)' }}>98% MATCH: MID-CENTURY MODERN</div>
                <div style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '4px', fontSize: '11px', fontWeight: 700, backdropFilter: 'blur(4px)' }}>EXPOSURE: SOUTH-FACING</div>
                <div style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '4px', fontSize: '11px', fontWeight: 700, backdropFilter: 'blur(4px)' }}>CEILING HEIGHT: 11FT</div>
              </div>
            </div>

            {/* Text Side */}
            <div style={{ width: '380px', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(218,41,28,0.1)', color: '#da291c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'white', margin: '0 0 16px', letterSpacing: '-0.5px', lineHeight: 1.2 }}>Aesthetic Vibe Matrix</h3>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                We built an index of 40+ architectural archetypes. From turn-key Brutalist lofts to gut-job Victorians, our Vision models understand aesthetic nuance completely invisible to the MLS.
              </p>
            </div>
          </div>

          {/* Card 2: Deep Asset Extraction (Spans 4 cols) */}
          <div style={{ 
            gridColumn: 'span 4', 
            background: 'rgba(255,255,255,0.03)', borderRadius: '32px', 
            border: '1px solid rgba(255,255,255,0.06)', padding: '40px',
            display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(37,99,235,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'white', margin: '0 0 16px', letterSpacing: '-0.5px' }}>Deep Asset Extraction</h3>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6, fontWeight: 500, position: 'relative', zIndex: 2 }}>
              Agents forget to list the $20,000 Sub-Zero fridge or the chevron white oak floors. Our engine doesn't. We instantly extract hundreds of premium data points directly from listing photos.
            </p>

            {/* Visual Tags */}
            <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
              {['Sub-Zero', 'Chevron Oak', 'Quartzite', 'Pot Lights'].map((tag, i) => (
                <div key={i} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', fontSize: '12px', fontWeight: 600, color: 'white' }}>
                  {tag}
                </div>
              ))}
            </div>

            {/* Glowing orb */}
            <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)', borderRadius: '50%', zIndex: 1 }} />
          </div>

          {/* Card 3: Neural Similarity Engine (Spans 12 cols, wide format) */}
          <div style={{ 
            gridColumn: 'span 12', 
            background: 'rgba(255,255,255,0.03)', borderRadius: '32px', 
            border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
            display: 'flex', position: 'relative', height: '280px'
          }}>
            <div style={{ flex: '1', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 2 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(124,58,237,0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'white', margin: '0 0 16px', letterSpacing: '-0.5px' }}>Neural Similarity Engine</h3>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6, fontWeight: 500, maxWidth: '600px' }}>
                Found the perfect chef’s kitchen but in the wrong neighborhood? One click deploys our massive vector database to instantly surface exact architectural matches across the country.
              </p>
            </div>
            
            {/* Neural Network Graphic area */}
            <div style={{ flex: '1', position: 'relative' }}>
               <div style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                 {/* Source Image */}
                 <div style={{ width: '120px', height: '120px', borderRadius: '20px', background: 'url("https://images.unsplash.com/photo-1556910103-1c02745a8728?auto=format&fit=crop&q=80&w=400") center/cover', border: '2px solid rgba(255,255,255,0.2)', position: 'relative', zIndex: 2 }} />
                 {/* Connection Lines */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, rgba(255,255,255,0.1), #8b5cf6)' }} />
                    <div style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, rgba(255,255,255,0.1), #8b5cf6)' }} />
                    <div style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, rgba(255,255,255,0.1), #8b5cf6)' }} />
                 </div>
                 {/* Match Images */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ width: '80px', height: '60px', borderRadius: '12px', background: 'url("https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=400") center/cover', border: '1px solid #8b5cf6', opacity: 0.9 }} />
                    <div style={{ width: '80px', height: '60px', borderRadius: '12px', background: 'url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400") center/cover', border: '1px solid #8b5cf6', opacity: 0.7 }} />
                    <div style={{ width: '80px', height: '60px', borderRadius: '12px', background: 'url("https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=400") center/cover', border: '1px solid #8b5cf6', opacity: 0.5 }} />
                 </div>
               </div>
            </div>
            {/* Decorative background glow */}
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '50%', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.05))', zIndex: 1 }} />
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}} />
    </section>
  );
}
