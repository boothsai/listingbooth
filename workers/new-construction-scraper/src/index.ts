/**
 * New Construction Scraper — Cloudflare Worker (Daily Cron)
 * 
 * Scrapes Ontario pre-construction project data from public sources:
 * 1. BuzzBuzzHome RSS/HTML (buzzbuzzhome.com)
 * 2. Livabl new condos feed (livabl.com)
 * 
 * Upserts normalized project data into Supabase `new_construction_projects`.
 * Runs daily at 6 AM ET (10:00 UTC).
 */

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
}

interface Project {
  slug: string;
  name: string;
  builder: string;
  city: string;
  province: string;
  price_from: number | null;
  property_type: string;
  status: string;
  description: string;
  features: string[];
  completion_year: number | null;
  total_units: number | null;
  color: string;
  photo_url: string | null;
}

// Color palette for different cities
const CITY_COLORS: Record<string, string> = {
  'Toronto': '#2563eb',
  'Ottawa': '#7c3aed',
  'Mississauga': '#059669',
  'Oakville': '#dc2626',
  'Hamilton': '#ea580c',
  'Vaughan': '#0891b2',
  'Brampton': '#4f46e5',
  'Markham': '#be185d',
  'default': '#6366f1',
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function extractPrice(text: string): number | null {
  const match = text.match(/\$?([\d,]+)/);
  if (!match) return null;
  return parseInt(match[1].replace(/,/g, ''), 10);
}

/**
 * Source 1: BuzzBuzzHome — Ontario new construction listings
 * Scrapes the HTML listing pages for Toronto and Ottawa
 */
async function scrapeBuzzBuzzHome(): Promise<Project[]> {
  const projects: Project[] = [];
  const cities = [
    { name: 'Toronto', url: 'https://www.buzzbuzzhome.com/ca/on/toronto' },
    { name: 'Ottawa', url: 'https://www.buzzbuzzhome.com/ca/on/ottawa' },
    { name: 'Mississauga', url: 'https://www.buzzbuzzhome.com/ca/on/mississauga' },
    { name: 'Hamilton', url: 'https://www.buzzbuzzhome.com/ca/on/hamilton' },
  ];

  for (const city of cities) {
    try {
      const res = await fetch(city.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ListingBoothBot/1.0; +https://listingbooth.com)',
          'Accept': 'text/html',
        },
      });

      if (!res.ok) {
        console.log(`[BBH] ${city.name}: HTTP ${res.status}`);
        continue;
      }

      const html = await res.text();
      
      // Extract project cards using regex patterns (no DOM parser needed)
      // BuzzBuzzHome uses structured data in their project cards
      const projectPattern = /<a[^>]*href="\/ca\/[^"]*\/([^"]+)"[^>]*class="[^"]*project[^"]*"[^>]*>[\s\S]*?<\/a>/gi;
      const namePattern = /<h[23][^>]*class="[^"]*name[^"]*"[^>]*>([^<]+)<\/h[23]>/i;
      const builderPattern = /<span[^>]*class="[^"]*builder[^"]*"[^>]*>([^<]+)<\/span>/i;
      const pricePattern = /(?:from|starting)\s*\$?([\d,]+)/i;
      const typePattern = /(condo|townho|detach|semi|stack|freehold)/i;

      // Simpler approach: extract project names and details from structured elements
      const titleMatches = html.matchAll(/<h[23][^>]*>([^<]{5,60})<\/h[23]>/gi);
      
      let count = 0;
      for (const match of titleMatches) {
        if (count >= 10) break; // Cap at 10 per city
        
        const name = match[1].trim();
        // Skip navigation/footer headings
        if (name.includes('Navigate') || name.includes('About') || name.includes('Follow') || 
            name.includes('Contact') || name.length < 5 || name.includes('Search')) continue;
        
        // Try to extract surrounding context
        const idx = match.index ?? 0;
        const context = html.slice(Math.max(0, idx - 500), Math.min(html.length, idx + 1000));
        
        const builderMatch = context.match(/(?:by|developer|builder)[:\s]*([A-Z][a-zA-Z\s&]+?)(?:<|,|\.|$)/);
        const priceMatch = context.match(pricePattern);
        const typeMatch = context.match(typePattern);
        const imgMatch = context.match(/src="(https?:\/\/[^"]*(?:\.jpg|\.png|\.webp)[^"]*)"/i);

        const slug = slugify(name);
        
        // Avoid duplicates
        if (projects.some(p => p.slug === slug)) continue;

        const propertyType = typeMatch 
          ? typeMatch[1].toLowerCase().includes('condo') ? 'Condominiums'
            : typeMatch[1].toLowerCase().includes('town') ? 'Townhomes'
            : typeMatch[1].toLowerCase().includes('detach') ? 'Detached Homes'
            : typeMatch[1].toLowerCase().includes('semi') ? 'Semi-Detached'
            : 'Mixed'
          : 'Condominiums';

        projects.push({
          slug,
          name,
          builder: builderMatch?.[1]?.trim() ?? 'TBD',
          city: city.name,
          province: 'ON',
          price_from: priceMatch ? extractPrice(priceMatch[0]) : null,
          property_type: propertyType,
          status: 'Now Selling',
          description: `New ${propertyType.toLowerCase()} development in ${city.name}, Ontario. Contact ListingBooth for VIP pricing and floor plans.`,
          features: [],
          completion_year: null,
          total_units: null,
          color: CITY_COLORS[city.name] ?? CITY_COLORS['default'],
          photo_url: imgMatch?.[1] ?? null,
        });
        count++;
      }

      console.log(`[BBH] ${city.name}: found ${count} projects`);
    } catch (err) {
      console.error(`[BBH] ${city.name} error:`, err);
    }
  }

  return projects;
}

/**
 * Source 2: Livabl (formerly BuzzBuzzHome's partner) — Toronto condo market
 */
async function scrapeLivabl(): Promise<Project[]> {
  const projects: Project[] = [];

  try {
    const res = await fetch('https://www.livabl.com/new-condos/toronto', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ListingBoothBot/1.0; +https://listingbooth.com)',
        'Accept': 'text/html',
      },
    });

    if (!res.ok) {
      console.log(`[Livabl] HTTP ${res.status}`);
      return projects;
    }

    const html = await res.text();

    // Extract project data from Livabl's structured HTML
    const titleMatches = html.matchAll(/<h[23][^>]*>([^<]{5,60})<\/h[23]>/gi);

    let count = 0;
    for (const match of titleMatches) {
      if (count >= 15) break;

      const name = match[1].trim();
      if (name.includes('Navigate') || name.includes('About') || name.includes('Follow') ||
          name.includes('Contact') || name.length < 5 || name.includes('Search') ||
          name.includes('Filter') || name.includes('Sort')) continue;

      const slug = slugify(name);
      if (projects.some(p => p.slug === slug)) continue;

      const idx = match.index ?? 0;
      const context = html.slice(Math.max(0, idx - 500), Math.min(html.length, idx + 1000));
      
      const builderMatch = context.match(/(?:by|developer)[:\s]*([A-Z][a-zA-Z\s&]+?)(?:<|,|\.|$)/);
      const priceMatch = context.match(/(?:from|starting)\s*\$?([\d,]+)/i);
      const imgMatch = context.match(/src="(https?:\/\/[^"]*(?:\.jpg|\.png|\.webp)[^"]*)"/i);

      projects.push({
        slug,
        name,
        builder: builderMatch?.[1]?.trim() ?? 'TBD',
        city: 'Toronto',
        province: 'ON',
        price_from: priceMatch ? extractPrice(priceMatch[0]) : null,
        property_type: 'Condominiums',
        status: 'Pre-Construction',
        description: `New condominium development in Toronto, Ontario. Contact ListingBooth for exclusive VIP pricing, floor plans, and first access.`,
        features: [],
        completion_year: null,
        total_units: null,
        color: CITY_COLORS['Toronto'],
        photo_url: imgMatch?.[1] ?? null,
      });
      count++;
    }

    console.log(`[Livabl] Toronto: found ${count} projects`);
  } catch (err) {
    console.error('[Livabl] error:', err);
  }

  return projects;
}

/**
 * Upsert projects into Supabase
 */
async function upsertToSupabase(env: Env, projects: Project[]): Promise<number> {
  if (projects.length === 0) return 0;

  // Deduplicate by slug (prefer from BuzzBuzzHome over Livabl)
  const bySlug = new Map<string, Project>();
  for (const p of projects) {
    if (!bySlug.has(p.slug)) {
      bySlug.set(p.slug, p);
    }
  }

  const unique = Array.from(bySlug.values());

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/new_construction_projects`, {
    method: 'POST',
    headers: {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',  // Upsert on unique slug
    },
    body: JSON.stringify(unique.map(p => ({
      slug: p.slug,
      name: p.name,
      builder: p.builder,
      city: p.city,
      province: p.province,
      price_from: p.price_from,
      property_type: p.property_type,
      status: p.status,
      description: p.description,
      features: p.features,
      completion_year: p.completion_year,
      total_units: p.total_units,
      color: p.color,
      photo_url: p.photo_url,
    }))),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error('[Supabase] Upsert failed:', res.status, errBody);
    return 0;
  }

  console.log(`[Supabase] Upserted ${unique.length} projects`);
  return unique.length;
}

export default {
  // Daily cron trigger
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(`[Cron] New construction scrape starting at ${new Date().toISOString()}`);

    const [bbhProjects, livablProjects] = await Promise.all([
      scrapeBuzzBuzzHome(),
      scrapeLivabl(),
    ]);

    const allProjects = [...bbhProjects, ...livablProjects];
    console.log(`[Cron] Total scraped: ${allProjects.length} projects`);

    if (allProjects.length > 0) {
      const upserted = await upsertToSupabase(env, allProjects);
      console.log(`[Cron] Upserted ${upserted} projects to Supabase`);
    } else {
      console.log('[Cron] No projects scraped — keeping existing data');
    }

    console.log(`[Cron] Complete at ${new Date().toISOString()}`);
  },

  // Manual trigger via HTTP (for testing)
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/trigger') {
      console.log('[Manual] Scrape triggered');

      const [bbhProjects, livablProjects] = await Promise.all([
        scrapeBuzzBuzzHome(),
        scrapeLivabl(),
      ]);

      const allProjects = [...bbhProjects, ...livablProjects];
      let upserted = 0;

      if (allProjects.length > 0) {
        upserted = await upsertToSupabase(env, allProjects);
      }

      return new Response(JSON.stringify({
        success: true,
        scraped: allProjects.length,
        upserted,
        sources: {
          buzzbuzzhome: bbhProjects.length,
          livabl: livablProjects.length,
        },
        projects: allProjects.map(p => ({ slug: p.slug, name: p.name, city: p.city, builder: p.builder })),
      }, null, 2), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      name: 'new-construction-scraper',
      version: '1.0.0',
      schedule: 'Daily at 6:00 AM ET (10:00 UTC)',
      endpoints: {
        '/trigger': 'Manual scrape trigger (GET)',
        '/': 'Health check',
      },
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
