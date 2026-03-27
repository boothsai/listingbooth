import type { Metadata } from 'next';
import SellSection from '@/components/sections/SellSection';

export const metadata: Metadata = {
  title: 'Sell Your Home | Free AI-Powered CMA Report | ListingBooth',
  description: 'Get a free instant home valuation, then unlock a full Comparative Market Analysis with AI Vision scoring, sold comparables, and a licensed REALTOR review.',
  openGraph: {
    title: 'Sell Your Home — Free AI CMA Report | ListingBooth',
    description: 'Instant valuation + full premium CMA with AI Vision analysis and REALTOR® review.',
    url: 'https://listingbooth.com/sell',
    siteName: 'ListingBooth',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Sell Your Home | ListingBooth' },
  alternates: { canonical: 'https://listingbooth.com/sell' },
};

export default function SellPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
      <SellSection />
    </main>
  );
}
