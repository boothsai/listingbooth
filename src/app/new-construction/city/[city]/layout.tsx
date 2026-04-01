import { Metadata } from 'next';
import { ReactNode } from 'react';

// Format dynamic slug to proper name (e.g., "ottawa" -> "Ottawa", "richmond-hill" -> "Richmond Hill")
function formatCityName(slug: string) {
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const resolvedParams = params;
  const cityName = formatCityName(resolvedParams.city);
  
  return {
    title: `New Construction Homes in ${cityName} | Pre-Construction Pricing & Floorplans | ListingBooth`,
    description: `Discover exclusive VIP access, pricing, and floorplans for new construction communities and pre-construction developments in ${cityName}, Ontario. Analyze Builder Score verified developments.`,
  };
}

export default function CitySiloLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
