import type { Metadata } from 'next';
import MapSearchSection from '@/components/sections/MapSearchSection';

export const metadata: Metadata = {
  title: 'Map Search | Interactive Property Map | ListingBooth',
  description: 'Explore real estate listings on an interactive map. Draw your ideal neighbourhood, view school zones, transit lines, and live price heat maps powered by CREA DDF®.',
  openGraph: {
    title: 'Map Search | ListingBooth',
    description: 'Interactive geospatial property explorer with live listing data.',
    url: 'https://listingbooth.com/map-search',
    siteName: 'ListingBooth',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Map Search | ListingBooth' },
  alternates: { canonical: 'https://listingbooth.com/map-search' },
};
export default function MapSearchPage() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: '110px', backgroundColor: '#fff' }}>
      
      {/* Premium Standalone Wrapper Header */}
      <div style={{ backgroundColor: '#111', padding: '60px 24px', textAlign: 'center', marginBottom: '-50px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: 'white', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            Geospatial Explorer.
          </h1>
          <p style={{ margin: 0, fontSize: '18px', color: '#888', lineHeight: 1.6 }}>
            Command the market from above. Interactive mapping telemetry plotting high-intent active properties.
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 20 }}>
        <MapSearchSection />
      </div>

    </main>
  );
}
