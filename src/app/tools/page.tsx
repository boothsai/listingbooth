import type { Metadata } from 'next';
import ToolsSection from '@/components/sections/ToolsSection';

export const metadata: Metadata = {
  title: 'Real Estate Tools | 10 Calculators for Buyers, Sellers & Investors | ListingBooth',
  description: 'The most comprehensive suite of Canadian real estate calculators. Mortgage payments, land transfer tax, CMHC insurance, closing costs, investment ROI, stress test, and more.',
  openGraph: {
    title: 'Real Estate Power Tools | ListingBooth',
    description: '10 institutional-grade calculators for every Canadian real estate decision.',
    url: 'https://listingbooth.com/tools',
    siteName: 'ListingBooth',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Real Estate Power Tools | ListingBooth' },
  alternates: { canonical: 'https://listingbooth.com/tools' },
};

export default function ToolsPage() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: '110px', backgroundColor: '#0a0a0a' }}>
      
      {/* Hero Header */}
      <div style={{ padding: '80px 5% 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(218,41,28,0.05) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: '4px', background: 'rgba(218,41,28,0.1)', color: '#da291c', fontWeight: 800, fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#da291c', boxShadow: '0 0 8px #da291c' }} />
            Power Tools
          </div>
          <h1 style={{ margin: '0 0 24px', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1.05 }}>
            Every Calculator<br/>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>You{"'"}ll Ever Need.</span>
          </h1>
          <p style={{ margin: 0, fontSize: '20px', color: 'rgba(255,255,255,0.5)', maxWidth: '700px', lineHeight: 1.5, fontWeight: 500 }}>
            10 institutional-grade tools for buyers, sellers, and investors — built with real Canadian tax rates, CMHC premium tables, and OSFI stress test rules.
          </p>
        </div>
      </div>
      {/* Comparison Engine CTA */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 48px', padding: '0 5%' }}>
        <a href="/tools/compare" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '32px 40px', borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(37,99,235,0.05) 100%)',
          border: '1px solid rgba(37,99,235,0.2)', textDecoration: 'none', color: 'white',
          transition: 'all 0.2s', flexWrap: 'wrap', gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(37,99,235,0.2)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>⚡</div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 900, letterSpacing: '-0.5px' }}>Property Comparison Engine</p>
              <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Pull any listing from the MLS® and compare them side-by-side. Price, AI Score, $/sqft — everything.</p>
            </div>
          </div>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#3b82f6', flexShrink: 0 }}>Launch Tool →</span>
        </a>
      </div>

      <ToolsSection />
    </main>
  );
}
