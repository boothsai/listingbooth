import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market Report | Live CREA DDF® Market Intelligence | ListingBooth',
  description: 'Real-time market statistics for Canadian cities. Median prices, days on market, new inventory, and trend analysis — powered directly by the CREA Data Distribution Facility.',
  openGraph: {
    title: 'Market Report | ListingBooth',
    description: 'Live market intelligence powered by CREA DDF® data.',
    url: 'https://listingbooth.com/market-report',
    siteName: 'ListingBooth',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Market Report | ListingBooth' },
  alternates: { canonical: 'https://listingbooth.com/market-report' },
};

export default function MarketReportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
