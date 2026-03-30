import type { Metadata } from 'next';
import MapExplorer from '@/components/MapExplorer/MapExplorer';

export const metadata: Metadata = {
  title: 'Map Search | Interactive Property Explorer | ListingBooth',
  description: 'Explore real estate listings on a premium interactive map. Filter by price, beds, property type. Live MLS® data powered by CREA DDF® across Ottawa, Toronto, and the GTA.',
  openGraph: {
    title: 'Map Search | ListingBooth',
    description: 'Interactive geospatial property explorer with live listing data across Ontario.',
    url: 'https://listingbooth.com/map-search',
    siteName: 'ListingBooth',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Map Search | ListingBooth' },
  alternates: { canonical: 'https://listingbooth.com/map-search' },
};

export default function MapSearchPage() {
  return (
    <main style={{ height: '100vh', overflow: 'hidden', paddingTop: '80px' }}>
      <MapExplorer />
    </main>
  );
}
