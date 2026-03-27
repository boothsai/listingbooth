'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function VisionHero() {
  const [query, setQuery] = useState('');
  const [activePlaceholder, setActivePlaceholder] = useState(0);

  const placeholders = [
    "Mid-Century Modern with a Waterfall Island...",
    "Brutalist concrete loft with exposed beams...",
    "Turn-key bungalow backing onto a ravine...",
    "Victorian estate with original hardwood floors...",
    "Move-in ready condo with floor-to-ceiling windows..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePlaceholder(p => (p + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section style={{ 
      minHeight: '85vh', 
      padding: '160px 5% 80px', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      position: 'relative',
      overflow: 'hidden',
      background: '#0a0a0a'
    }}>
      {/* Dynamic Background */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(rgba(10,10,10,0.8), rgba(10,10,10,1)), url("/vision-bg.jpg") center/cover',
        opacity: 0.6, zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ 
          display: 'inline-flex', padding: '8px 16px', borderRadius: '100px', 
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#da291c', fontWeight: 800, fontSize: '13px', letterSpacing: '0.1em',
          textTransform: 'uppercase', marginBottom: '32px', alignItems: 'center', gap: '8px'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#da291c', boxShadow: '0 0 10px #da291c' }} />
          AI Vision Active
        </div>

        <h1 style={{ 
          margin: '0 0 24px', 
          fontSize: 'clamp(48px, 6vw, 84px)', 
          fontWeight: 900, 
          color: 'white', 
          lineHeight: 1.05,
          letterSpacing: '-0.04em'
        }}>
          Real Estate Search, <br />
          <span style={{ color: '#888' }}>Rebuilt for the AI Era.</span>
        </h1>
        
        <p style={{ 
          margin: '0 0 48px', 
          fontSize: 'clamp(20px, 2.5vw, 26px)', 
          color: 'rgba(255,255,255,0.7)', 
          maxWidth: '800px',
          fontWeight: 500,
          lineHeight: 1.4
        }}>
          Don't search for "4 beds, 2 baths". Tell our bare-metal Vision AI exactly what you want, and we'll analyze every pixel on the MLS to find it.
        </p>

        {/* Omnibar */}
        <div style={{ 
          position: 'relative', maxWidth: '800px',
          background: 'rgba(255,255,255,0.03)', borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)',
          padding: '8px', display: 'flex', alignItems: 'center',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)'
        }}>
          {/* AI Sparkle Icon */}
          <div style={{ padding: '0 20px', fontSize: '24px', opacity: 0.8 }}>✨</div>
          
          <div style={{ position: 'relative', flex: 1, height: '60px' }}>
            {query === '' && (
              <div style={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.4)',
                fontSize: '20px', fontWeight: 500, pointerEvents: 'none',
                transition: 'opacity 0.3s'
              }}>
                {placeholders[activePlaceholder]}
              </div>
            )}
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ 
                width: '100%', height: '100%', background: 'transparent',
                border: 'none', color: 'white', fontSize: '20px',
                fontWeight: 600, outline: 'none',
                position: 'relative', zIndex: 5
              }}
            />
          </div>

          <button style={{ 
            height: '60px', padding: '0 40px', borderRadius: '16px',
            background: '#da291c', color: 'white', fontWeight: 800,
            fontSize: '18px', border: 'none', cursor: 'pointer',
            transition: 'all 0.2s', letterSpacing: '-0.5px'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            Search Specs
          </button>
        </div>

        {/* Feature Pills */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap' }}>
          {[
            'Extracts subzero fridges from photos', 
            'Scores homes by "Vibe" (Brutalist, Turn-key)', 
            'Visual match: "Find homes like this"'
          ].map((pill, i) => (
            <div key={i} style={{ 
              padding: '10px 20px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)',
              fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span style={{ color: '#da291c' }}>✓</span> {pill}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
