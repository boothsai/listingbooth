import { Metadata } from 'next';
import { searchListings } from '@/lib/supabase/ddf';
import { getDemographics } from '@/lib/demographics';
import Link from 'next/link';

// Force runtime rendering — prevents build-time data fetching that hangs the build
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// Ensure this route is always fresh for Googlebot SEO and compliant with RECO Active-only checks
export const revalidate = 3600; 

interface PageProps {
  params: Promise<{ city: string; slug: string[] }>;
}

/**
 * AI-POWERED SEMANTIC ROUTER
 * Converts URL slugs into structured keyword variables, matching them against Gemini Vision tags.
 * Ex: /ottawa/nepean/homes-with-wine-cellars -> { community: 'nepean', feature: 'wine_cellar' }
 */
function parseSemanticSlug(slugs: string[]) {
  let community = '';
  let feature = '';
  let beds = 0;

  slugs.forEach(part => {
    // Detect bedrooms
    if (part.includes('-beds') || part.includes('-bedrooms')) {
      beds = parseInt(part.split('-')[0]) || 0;
    } 
    // Detect AI exact tags mapped to slugs
    else if (part.includes('wine-cellar')) feature = 'wine_cellar';
    else if (part.includes('vaulted-ceiling')) feature = 'vaulted_ceiling';
    else if (part.includes('hardwood-floor')) feature = 'hardwood_floors';
    else if (part.includes('pool')) feature = 'pool';
    else if (part.includes('walkout-basement')) feature = 'walkout';
    else if (part.includes('granite-counter')) feature = 'granite_counters';
    // Fallback: Assume it's a neighborhood string
    else community = part.replace(/-/g, ' '); 
  });

  return { community, feature, beds };
}

// 1. DYNAMIC METADATA GENERATOR (FOR GOOGLE RICH SNIPPETS)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city, slug } = await params;
  const decodedCity = decodeURIComponent(city).charAt(0).toUpperCase() + decodeURIComponent(city).slice(1);
  const { community, feature, beds } = parseSemanticSlug(slug);

  let title = `Homes for Sale in ${decodedCity}`;
  let displayFeature = feature ? feature.replace('_', ' ') : '';
  
  if (community && feature) title = `${displayFeature.charAt(0).toUpperCase() + displayFeature.slice(1)} Homes for Sale in ${community.charAt(0).toUpperCase() + community.slice(1)}, ${decodedCity}`;
  else if (community) title = `Homes for Sale in ${community.charAt(0).toUpperCase() + community.slice(1)}, ${decodedCity}`;
  else if (feature) title = `${displayFeature.charAt(0).toUpperCase() + displayFeature.slice(1)} Homes in ${decodedCity}`;
  if (beds > 0) title = `${beds}+ Bedroom ${title}`;

  return {
    title: `${title} | ListingBooth`,
    description: `Browse active MLS® and DDF® listings for ${title.toLowerCase()}. View verified data and high-res photos.`,
    alternates: {
      canonical: `https://listingbooth.com/${city}/${slug.join('/')}`
    }
  };
}

// 2. THE SERVER COMPONENT (UX & DATA)
export default async function PseoLandingPage({ params }: PageProps) {
  const { city, slug } = await params;
  const decodedCity = decodeURIComponent(city).charAt(0).toUpperCase() + decodeURIComponent(city).slice(1);
  const { community, feature, beds } = parseSemanticSlug(slug);

  let searchQuery = '';
  if (community) searchQuery += `${community} `;

  // Fetch from the ghost agent's DDF database
  // Enforces 'active' status by default in searchListings
  const searchParams: any = {
    city: decodedCity,
    q: searchQuery.trim(),
    beds: beds > 0 ? beds : undefined,
    limit: 24
  };
  
  // Directly bridge the semantic URL slug into the Gemini Vision array POSTGREST payload!
  if (feature) {
    searchParams.features = [feature];
  }

  const result = await searchListings(searchParams);
  const listings = result.listings || [];

  // Construct the smart page headline
  let displayFeature = feature ? feature.replace('_', ' ') : '';
  let h1Raw = `${decodedCity} Real Estate`;
  if (community && feature) h1Raw = `${displayFeature.charAt(0).toUpperCase() + displayFeature.slice(1)} Properties in ${community.charAt(0).toUpperCase() + community.slice(1)}`;
  else if (community) h1Raw = `Homes for Sale in ${community.charAt(0).toUpperCase() + community.slice(1)}`;
  else if (feature) h1Raw = `${displayFeature.charAt(0).toUpperCase() + displayFeature.slice(1)} Properties in ${decodedCity}`;
  if (beds > 0) h1Raw = `${beds}+ Bedroom ${h1Raw}`;

  return (
    <div style={{ backgroundColor: '#fdfdfd', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* STRICT JSON-LD SCHEMA INJECTION FOR GOOGLE RICH SNIPPETS */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SearchResultsPage',
            'name': h1Raw,
            'description': `Browsing ${result.total} active MLS listings for ${h1Raw}.`,
            'about': {
              '@type': 'Place',
              'name': community ? community : decodedCity
            }
          })
        }}
      />

      {/* Dynamic Header Strip */}
      <div style={{ backgroundColor: '#111', padding: '120px 48px 48px', color: 'white' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-1px' }}>
          {h1Raw}
        </h1>
        <p style={{ fontSize: '18px', color: '#aaa', fontWeight: 500 }}>
          Found <strong style={{ color: '#da291c' }}>{result.total}</strong> active listings perfectly matching your search.
        </p>
        
        {feature && (
           <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '24px', padding: '8px 16px', backgroundColor: 'rgba(218,41,28,0.1)', color: '#da291c', borderRadius: '100px', fontSize: '14px', fontWeight: 800 }}>
             ✨ AI Vision Filter Active: {displayFeature}
           </div>
        )}
      </div>

      {/* Analytics & Demographic Injection Zone */}
      {community && (
        <div style={{ padding: '24px 48px', borderBottom: '1px solid #eaeaea', backgroundColor: 'white', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {(() => {
            const demo = getDemographics(community);
            if (!demo) return (
              <div style={{ padding: '16px 24px', backgroundColor: '#f9f9f9', borderRadius: '8px', flex: 1, borderLeft: '4px solid #da291c' }}>
                 <p style={{ margin: 0, fontSize: '14px', color: '#999', fontStyle: 'italic' }}>
                   Compiling deep demographic data and school boundary analytics for {community.charAt(0).toUpperCase() + community.slice(1)}...
                 </p>
              </div>
            );
            return (
              <>
                <div style={{ padding: '20px 24px', backgroundColor: '#fdfdfd', borderRadius: '12px', flex: '1 1 500px', border: '1px solid #eaeaea', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#111', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Living in {demo.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, padding: '4px 10px', backgroundColor: '#eefcf1', color: '#22c55e', borderRadius: '100px' }}>Walkscore: {demo.walkScore}</span>
                      <span style={{ fontSize: '12px', fontWeight: 800, padding: '4px 10px', backgroundColor: '#f0f5ff', color: '#3b82f6', borderRadius: '100px' }}>Transit: {demo.transitScore}</span>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 16px', fontSize: '15px', color: '#555', lineHeight: 1.6 }}>{demo.vibe}</p>
                  <div style={{ display: 'flex', gap: '24px', borderTop: '1px dashed #dedede', paddingTop: '16px' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Population</p>
                      <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#111' }}>{demo.population}</p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Median Income</p>
                      <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#green' }}>{demo.medianIncome}</p>
                    </div>
                  </div>
                </div>
                
                <div style={{ padding: '20px 24px', backgroundColor: '#fff', borderRadius: '12px', flex: '1 1 300px', border: '1px solid #eaeaea', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '14px', color: '#111', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #da291c', display: 'inline-block', paddingBottom: '4px' }}>
                    Top School Districts
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#444', lineHeight: 1.8 }}>
                    {demo.topSchools.map((school, i) => (
                      <li key={i} style={{ marginBottom: '8px' }}><strong>{school}</strong></li>
                    ))}
                  </ul>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* The Property Grid */}
      <div style={{ padding: '48px' }}>
        {listings.length === 0 ? (
           <div style={{ padding: '64px', textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '16px' }}>
             <h2 style={{ fontSize: '24px', fontWeight: 900 }}>Waitroom.</h2>
             <p style={{ color: '#666', fontSize: '16px' }}>No active properties in {decodedCity} currently have AI-verified <strong style={{color:'#111'}}>{displayFeature}</strong> characteristics.</p>
           </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
            {listings.map(l => (
              <Link href={`/listing/${l.listing_key}`} key={l.listing_key} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', transition: 'transform 0.2s', border: '1px solid #efefef', position: 'relative' }}>
                  <div style={{ position: 'relative', height: '220px', backgroundColor: '#eee' }}>
                    {l.photo_urls && l.photo_urls[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={l.photo_urls[0]} alt="Property" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>No Photo</div>
                    )}
                    {l.is_active && <div style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: '#da291c', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 800 }}>ACTIVE</div>}
                    
                    {/* Visual Tag on Thumbnail */}
                    {feature && l.features && l.features.includes(feature) && (
                      <div style={{ position: 'absolute', bottom: '16px', right: '16px', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: 'white', padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                         ✨ {displayFeature.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '20px' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 800, color: '#111' }}>
                      ${Number(l.list_price).toLocaleString()}
                    </p>
                    <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#555', fontWeight: 600 }}>
                      {l.bedrooms_total} Beds | {l.bathrooms_total} Baths | {l.property_type}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {l.address_street}, {l.address_city}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
