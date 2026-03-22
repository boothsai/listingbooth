import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Dynamic SSG/ISR Logic for Long-Tail SEO 
// Uses the native BOOTHS.AI API safeguards to guarantee RECO advertising compliance
import { fetchActiveSEOProperties } from '../../../../components/api/crm_mock'; // Replace with actual API client if extracted
import { createClient } from '@/lib/supabase/server';

// 🕵️ NEXUS SEO GATEWAY PROTOCOL (AHREFS/SEMRUSH ALTERNATIVE)
// Cross-repo relative import to bind to the custom Gemini AI Search Volume Estimator 
import { seoKeywordResearch, seoNLP } from '../../../../../Black Box Nexus/src/lib/gateway';

interface PageProps {
  params: {
    slug: string[]; // e.g., ['ottawa', 'kanata', 'townhomes']
  };
}

// 1. ISR Generation (Generates static pages in background, falling back to dynamic if fresh)
// Re-builds every hour (3600s) to keep status fresh and avoid "Bait and Switch" RECO violations
export const revalidate = 3600;

// 2. High-Performance Programmatic Semantic Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const [targetCity, targetArea, propertyType] = params.slug;
  const keyword = `${propertyType || 'homes'} for sale in ${targetArea ? targetArea : targetCity}`;

  try {
    // Harness Nexus SEO Gateway instead of Ahrefs
    const keywordData = await seoKeywordResearch(keyword);
    // Extrapolate the top LSI terms and highest search volume queries
    const primaryIntent = keywordData?.keywords?.[0] || { intent: 'transactional', volumeEstimate: '1000+' };

    return {
      title: `${targetArea ? targetArea.toUpperCase() : targetCity.toUpperCase()} ${propertyType ? propertyType.toUpperCase() : 'REAL ESTATE'} & Homes For Sale | eXp Realty`,
      description: `View ${primaryIntent.volumeEstimate} active MLS® listings for ${keyword}. Updated hourly. Brokered by Ali Abbas Team / eXp Realty, Brokerage.`,
      keywords: keywordData?.keywords?.map((k: any) => k.term).join(', ') || keyword,
      openGraph: {
        title: `${keyword} - Active Listings`,
        description: `Browse all RECO-compliant active listings in ${targetCity}.`,
        type: 'website',
      },
    };
  } catch (err) {
    // Fallback if cross-repo gateway fails during build
    return {
      title: `${keyword} | eXp Realty`,
      description: `Browse active properties for ${keyword}.`,
    };
  }
}

// 3. Dynamic Page Component
export default async function ProgrammaticSEOPage({ params }: PageProps) {
  const [city, neighborhood, type] = params.slug;
  const supabase = createClient();

  // Safely fetch ONLY 'Active' properties to adhere to the False Advertising Safeguard
  const { data: properties, error } = await supabase
    .from('core_logic.properties')
    .select('address, price, bedrooms, bathrooms, sqft, photo_urls, mls_number')
    .ilike('city', city)
    .eq('listing_status', 'Active')
    .limit(25);

  if (error || !properties || properties.length === 0) {
    notFound(); 
  }

  // Cross-analyze competitor content gaps using Nexus SEO NLP
  // This helps text blocks rank on Google by fulfilling missing semantic LSI variables
  const seedUrl = `https://competitor.ca/real-estate/${city}/${neighborhood}`;
  let gapContent = "Discover the best localized data for your next home.";
  try {
     const nlp = await seoNLP(`Ottawa ${neighborhood} real estate guide`);
     if (nlp && nlp.entities) {
         gapContent = `Trending neighborhood features: ${nlp.entities.slice(0, 3).map((e: any) => e.name).join(', ')}.`;
     }
  } catch (e) { }

  return (
    <main style={{ padding: '120px 48px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '16px' }}>
          {neighborhood ? neighborhood.replace('-', ' ') : city.replace('-', ' ')} {type ? type.replace('-', ' ') : 'Homes For Sale'}
        </h1>
        <p style={{ fontSize: '18px', color: '#666', maxWidth: '800px', lineHeight: 1.6 }}>
          {gapContent} Browse all {properties.length}+ active MLS® listings below, updated hourly to ensure strict real estate compliance.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
        {properties.map((prop: any) => (
          <div key={prop.mls_number} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ height: '220px', background: '#f5f5f5', backgroundImage: `url(${prop.photo_urls?.[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div style={{ padding: '24px' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#111', marginBottom: '8px' }}>
                ${Number(prop.price).toLocaleString()}
              </div>
              <div style={{ fontSize: '15px', color: '#555', marginBottom: '16px', fontWeight: 600 }}>
                {prop.address} • MLS® {prop.mls_number}
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#888', fontWeight: 500 }}>
                <span>{prop.bedrooms} Bed</span>
                <span>{prop.bathrooms} Bath</span>
                {prop.sqft && <span>{prop.sqft} SqFt</span>}
              </div>
            </div>
            {/* Registration Wall Trigger */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #eaeaea', background: '#fafafa' }}>
               <button style={{ width: '100%', padding: '12px', background: 'white', border: '1.5px solid #111', borderRadius: '8px', color: '#111', fontWeight: 700, cursor: 'pointer' }}>
                 View Full Details / Request Showing
               </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
