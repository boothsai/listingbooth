export const runtime = 'edge';
import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { ReactNode } from 'react';

// Connect to DB directly for SSR metadata extraction
function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!,
    { cookies: { getAll() { return []; }, setAll() {} } }
  );
}

// Dynamically generate SEO attributes (Meta Tags, JSON-LD)
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const resolvedParams = params;
  const slug = resolvedParams.slug;
  const supabase = getSupabase();
  
  const { data } = await supabase
    .schema('core_logic')
    .from('builder_communities')
    .select('*, builders(name, trust_score), builder_products(price_from)')
    .order('created_at', { ascending: false });

  if (!data) return { title: 'New Construction Project | ListingBooth' };

  // Match our slug generation format
  const match = data.find((c: any) => c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);
  
  if (!match) return { title: 'Project Not Found | ListingBooth' };

  const builderName = match.builders?.name || 'Top Builder';
  const trustScore = match.builders?.trust_score;
  const minPrice = match.builder_products?.map((p:any) => p.price_from).sort()[0];

  const trustStr = trustScore ? ` | ${trustScore}/100 Builder Score` : '';
  const priceStr = minPrice ? ` | From $${Math.round(minPrice / 1000)}k` : '';

  // E.g. "Brookline by Minto Communities in Ottawa | From $599k | 96/100 Trust Score"
  const title = `${match.name} by ${builderName} in ${match.city}${priceStr}${trustStr}`;
  
  return {
    title,
    description: `Get VIP access, floorplans, and VIP pricing for ${match.name}, a pre-construction development by ${builderName} in ${match.city}, ON.`,
    openGraph: {
      images: match.hero_image_url ? [match.hero_image_url] : [],
    }
  };
}

// Generate the JSON-LD Schema
async function generateJsonLd(slug: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .schema('core_logic')
    .from('builder_communities')
    .select('*, builders(name, trust_score), builder_products(price_from)')
    .order('created_at', { ascending: false });

  if (!data) return null;
  const match = data.find((c: any) => c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);
  if (!match) return null;

  const minPrice = match.builder_products?.map((p:any) => p.price_from).sort()[0];

  // Using schema.org/RealEstateListing to force rich snippets in Google Search
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    'name': `${match.name} by ${match.builders?.name}`,
    'description': `Pre-construction and new build community in ${match.city}.`,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': match.city,
      'addressRegion': 'ON',
      'addressCountry': 'CA'
    },
    'offers': minPrice ? {
      '@type': 'Offer',
      'price': minPrice,
      'priceCurrency': 'CAD'
    } : undefined
  };
}

export default async function NewConstructionSlugLayout({ 
  children, 
  params 
}: { 
  children: ReactNode, 
  params: { slug: string } 
}) {
  const resolvedParams = params;
  const schema = await generateJsonLd(resolvedParams.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
