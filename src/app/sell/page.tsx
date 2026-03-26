import type { Metadata } from 'next';
import SellSection from '@/components/sections/SellSection';

export const metadata: Metadata = {
  title: 'Sell Your Home | AI-Powered Home Valuations | ListingBooth',
  description: 'Get an instant AI-driven home valuation based on real-time CREA DDF® market data. Sell smarter with ListingBooth — the AI-first real estate portal.',
  openGraph: {
    title: 'Sell Your Home | ListingBooth',
    description: 'Instant AI home valuations powered by live MLS® data. Know your home\'s true worth.',
    url: 'https://listingbooth.com/sell',
    siteName: 'ListingBooth',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Sell Your Home | ListingBooth' },
  alternates: { canonical: 'https://listingbooth.com/sell' },
};
export default function SellPage() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: '110px', backgroundColor: '#fafafa' }}>
      
      {/* Premium Standalone Wrapper Header */}
      <div style={{ backgroundColor: '#111', padding: '60px 24px', textAlign: 'center', marginBottom: '-50px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: 'white', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            Unlock your home's equity.
          </h1>
          <p style={{ margin: 0, fontSize: '18px', color: '#888', lineHeight: 1.6 }}>
            Leverage Google Gemini-powered valuations and enterprise-grade market intelligence to price your property competitively.
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 20 }}>
        <SellSection />
      </div>

    </main>
  );
}
