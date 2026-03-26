import type { Metadata } from 'next';
import ToolsSection from '@/components/sections/ToolsSection';

export const metadata: Metadata = {
  title: 'Financial Tools | Mortgage Calculator & True Cost | ListingBooth',
  description: 'Calculate the true cost of homeownership including mortgage payments, property taxes, insurance, and closing costs. AI-powered financial infrastructure for Canadian real estate.',
  openGraph: {
    title: 'Financial Tools | ListingBooth',
    description: 'Mortgage calculators, true cost analysis, and pre-approval workflows.',
    url: 'https://listingbooth.com/tools',
    siteName: 'ListingBooth',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Financial Tools | ListingBooth' },
  alternates: { canonical: 'https://listingbooth.com/tools' },
};
export default function ToolsPage() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: '110px', backgroundColor: '#fafafa' }}>
      
      {/* Premium Standalone Wrapper Header */}
      <div style={{ backgroundColor: '#111', padding: '60px 24px', textAlign: 'center', marginBottom: '-50px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: 'white', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            Financial Infrastructure.
          </h1>
          <p style={{ margin: 0, fontSize: '18px', color: '#888', lineHeight: 1.6 }}>
            Calculate True Cost of Ownership, analyze mortgage vectors, and secure your pre-approval workflow.
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 20 }}>
        <ToolsSection />
      </div>

    </main>
  );
}
