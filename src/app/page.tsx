'use client';

import VisionHero from '@/components/sections/VisionHero';
import VisionAIFeatures from '@/components/sections/VisionAIFeatures';
import AestheticSeoGrid from '@/components/sections/AestheticSeoGrid';
import NewConstructionSpotlight from '@/components/sections/NewConstructionSpotlight';
import CityExplorer from '@/components/sections/CityExplorer';
import WhyListingBooth from '@/components/sections/WhyListingBooth';

export default function ConsumerHome() {
  return (
    <div style={{ background: '#fafafa' }}>
      {/* ── GOD-MODE VISION AI HERO ── */}
      <VisionHero />

      {/* ── THE MOAT: VISION AI FEATURES ── */}
      <VisionAIFeatures />

      {/* ── PROGRAMMATIC SEO: AESTHETIC SEARCH GRIDS ── */}
      <AestheticSeoGrid />

      {/* ── NEW CONSTRUCTION SPOTLIGHT ── */}
      <NewConstructionSpotlight />

      {/* ── CITY EXPLORER ── */}
      <CityExplorer />

      {/* ── WHY LISTINGBOOTH TRUST SECTION ── */}
      <WhyListingBooth />
    </div>
  );
}
