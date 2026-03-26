import type { Metadata } from 'next';
import BuySection from '@/components/sections/BuySection';

export const metadata: Metadata = {
  title: 'Buy a Home | Browse Active MLS® Listings | ListingBooth',
  description: 'Search thousands of active real estate listings across Canada. AI-powered property matching, photo galleries, and instant price comparisons — all powered by the CREA DDF® feed.',
  openGraph: {
    title: 'Buy a Home | ListingBooth',
    description: 'Browse premium homes with AI-driven insights. Updated in real-time from the MLS®.',
    url: 'https://listingbooth.com/buy',
    siteName: 'ListingBooth',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Buy a Home | ListingBooth' },
  alternates: { canonical: 'https://listingbooth.com/buy' },
};
export default function BuyPage() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: '110px', backgroundColor: '#fafafa' }}>
      
      {/* Premium Standalone Wrapper Header */}
      <div style={{ backgroundColor: '#111', padding: '60px 24px', textAlign: 'center', marginBottom: '-50px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: 'white', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            Find your dream home.
          </h1>
          <p style={{ margin: 0, fontSize: '18px', color: '#888', lineHeight: 1.6 }}>
            Browse luxury real estate, waterfront properties, and exclusive listings updated directly from the CREA DDF® feed.
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 20 }}>
        <BuySection />
      </div>

    </main>
  );
}
