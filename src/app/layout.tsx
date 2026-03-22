import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import NavHeader from '@/components/NavHeader';
import SiteFooter from '@/components/SiteFooter';
import ChatWidget from '@/components/ChatWidget';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });

export const metadata: Metadata = {
  title: 'ListingBooth.com | The AI-First Real Estate Portal',
  description: 'Discover premium homes and properties with AI-driven insights. Buy, sell, or invest smarter with ListingBooth.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <NavHeader />
        <main style={{ paddingTop: '110px' }}>
          {children}
        </main>
        <ChatWidget />
        <SiteFooter />
      </body>
    </html>
  );
}
