export const runtime = 'edge';
import { MetadataRoute } from 'next';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!,
    { cookies: { getAll() { return []; }, setAll() {} } }
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://listingbooth.com';
  
  // Base Routes
  const routes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/new-construction`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/sell`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];

  try {
    const supabase = getSupabase();
    
    // Fetch all pre-construction projects mapped heavily by the VABOT
    const { data: communities } = await supabase
      .schema('core_logic')
      .from('builder_communities')
      .select('name, created_at, status, city');

    if (communities) {
      communities.forEach((c: any) => {
        const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        // Active selling phases command higher crawl priority
        const priority = c.status === 'Now Selling' || c.status === 'Registration' ? 0.9 : 0.7;

        routes.push({
          url: `${baseUrl}/new-construction/${slug}`,
          lastModified: new Date(c.created_at),
          changeFrequency: 'daily',
          priority
        });
      });

      // Extract unique cities from communities
      const uniqueCities = Array.from(new Set(communities.map(c => c.city).filter(Boolean)));
      
      uniqueCities.forEach((cityStr: string) => {
        const citySlug = cityStr.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        routes.push({
          url: `${baseUrl}/new-construction/city/${citySlug}`,
          lastModified: new Date(), // Always fresh
          changeFrequency: 'daily',
          priority: 0.95 // Geo-silos command extreme priority
        });
      });
    }

  } catch (error) {
    console.error('[SITEMAP VABOT] Fail to source listings:', error);
  }

  return routes;
}
