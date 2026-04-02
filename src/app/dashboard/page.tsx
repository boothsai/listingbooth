'use client';

import VowYieldTools from '@/components/VowYieldTools';

export default function DashboardHomePage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#fdfdfc', position: 'relative', overflow: 'hidden' }}>
      
      {/* Luxury Bright Mesh Background */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '800px', background: 'linear-gradient(180deg, rgba(240,244,255,0.6) 0%, rgba(253,253,252,0) 100%)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: -100, right: -100, width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(218,41,28,0.04) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 40px', position: 'relative', zIndex: 10 }}>
        
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '36px', fontWeight: 900, color: '#111', letterSpacing: '-1px' }}>Welcome Back, Premium Member</h1>
          <p style={{ margin: 0, fontSize: '15px', color: '#666', fontWeight: 500 }}>Your personalized intelligence portal.</p>
        </div>

        {/* Render our sophisticated Booths.ai Yield Tools */}
        <VowYieldTools />

      </div>
    </main>
  );
}
