import type { Metadata } from 'next';
import PlatformSection from '@/components/sections/PlatformSection';

export const metadata: Metadata = {
  title: 'Platform | AI-First Real Estate Technology | ListingBooth',
  description: 'ListingBooth is Canada\'s AI-first real estate portal. Powered by CREA DDF®, Gemini Vision AI, and enterprise-grade geospatial intelligence.',
  openGraph: {
    title: 'Platform | ListingBooth',
    description: 'The technology behind Canada\'s most advanced real estate portal.',
    url: 'https://listingbooth.com/platform',
    siteName: 'ListingBooth',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Platform | ListingBooth' },
  alternates: { canonical: 'https://listingbooth.com/platform' },
};
export default function PlatformPage() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: '110px', backgroundColor: '#0a0a0a' }}>
      <PlatformSection />
    </main>
  );
}
