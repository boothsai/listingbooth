import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import NavHeader from '@/components/NavHeader';
import SiteFooter from '@/components/SiteFooter';
import ChatWidget from '@/components/ChatWidget';
import RegistrationWall from '@/components/RegistrationWall';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });

export const metadata: Metadata = {
  title: 'ListingBooth.com | The AI-First Real Estate Portal',
  description: 'Discover premium homes and properties with AI-driven insights. Buy, sell, or invest smarter with ListingBooth.',
  openGraph: {
    title: 'ListingBooth.com | The AI-First Real Estate Portal',
    description: 'Canada\'s most advanced real estate search engine. AI-powered listings, instant valuations, and interactive map search.',
    url: 'https://listingbooth.com',
    siteName: 'ListingBooth',
    type: 'website',
    locale: 'en_CA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ListingBooth.com | AI-First Real Estate',
    description: 'Search homes, get AI valuations, explore interactive maps.',
  },
  alternates: { canonical: 'https://listingbooth.com' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <NavHeader />
        <ErrorBoundary>
          <main style={{ paddingTop: '80px' }}>
            {children}
          </main>
        </ErrorBoundary>
        <ErrorBoundary>
          <ChatWidget />
          <RegistrationWall token="global" agentName="ListingBooth Partners" />
        </ErrorBoundary>
        <SiteFooter />
      </body>
    </html>
  );
}
