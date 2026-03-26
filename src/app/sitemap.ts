import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// Extremely aggressive cache: Rebuilds sitemap every hour to reflect sold/active DDF changes
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // 1. Establish Secure Server Connection
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!,
    { db: { schema: 'res_ddf' } }
  );

  const siteMap: MetadataRoute.Sitemap = [];

  // ==========================================
  // STATIC CORE PAGES
  // ==========================================
  const staticRoutes = [
    { path: '', priority: 1.0 },
    { path: '/buy', priority: 0.9 },
    { path: '/sell', priority: 0.9 },
    { path: '/map-search', priority: 0.9 },
    { path: '/market-report', priority: 0.8 },
    { path: '/tools', priority: 0.7 },
    { path: '/platform', priority: 0.6 },
  ];
  staticRoutes.forEach(route => {
    siteMap.push({
      url: `${baseUrl}${route.path}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: route.priority,
    });
  });

  // ==========================================
  // PROGRAMMATIC LONG-TAIL PSEO (THE AI FEATURE MATRIX)
  // Generates /ottawa/[community]/[feature] routes
  // ==========================================
  const topOttawaCommunities = [
    'westboro', 'kanata', 'nepean', 'glebe', 'orleans', 
    'barrhaven', 'stittsville', 'sandy-hill', 'centretown', 'rockcliffe-park'
  ];
  const aiFeatures = [
    'wine-cellar', 'walkout-basement', 'granite-counters', 
    'hardwood-floors', 'swimming-pool', 'smart-home'
  ];

  // Map pure community pages
  topOttawaCommunities.forEach(community => {
    siteMap.push({
        url: `${baseUrl}/ottawa/${community}`,
        lastModified: new Date(),
        changeFrequency: 'hourly', // High frequency to catch fresh DDF listings
        priority: 0.9,
    });
    
    // Cross-pollinate community with AI features
    aiFeatures.forEach(feature => {
      siteMap.push({
          url: `${baseUrl}/ottawa/${community}/${feature}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
      });
    });
  });

  // ==========================================
  // INDIVIDUAL PROPERTY SITEMAP (THE 140,000 DB DUMP)
  // ==========================================
  
  // NOTE: Next.js standard sitemap limits 50,000 URLs per file. 
  // We chunk the DB fetch to stay within safe RAM limits during the edge build.
  try {
    const { data: listings } = await supabase
      .from('listings')
      .select('listing_key, updated_at')
      .eq('is_active', true)
      .limit(10000); // Fetch top 10K most recently updated properties to prevent edge timeouts

    if (listings && listings.length > 0) {
      listings.forEach(listing => {
        siteMap.push({
          url: `${baseUrl}/listing/${listing.listing_key}`,
          lastModified: new Date(listing.updated_at || new Date()),
          changeFrequency: 'daily',
          priority: 0.7,
        });
      });
    }
  } catch (error) {
    console.error('Failed to fetch listings for sitemap generation:', error);
  }

  return siteMap;
}
