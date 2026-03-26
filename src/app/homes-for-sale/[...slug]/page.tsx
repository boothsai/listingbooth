export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const [targetCity, targetArea, propertyType] = params.slug;
  const keyword = `${propertyType || 'homes'} for sale in ${targetArea ? targetArea : targetCity}`;

  return {
    title: `${targetArea ? targetArea.toUpperCase() : targetCity?.toUpperCase()} ${propertyType ? propertyType.toUpperCase() : 'REAL ESTATE'} | eXp Realty`,
    description: `Browse active MLS® listings for ${keyword}. Updated hourly. Brokered by Ali Abbas Team / eXp Realty, Brokerage.`,
    openGraph: {
      title: `${keyword} - Active Listings`,
      description: `Browse all RECO-compliant active listings.`,
      type: 'website',
    },
  };
}

export default async function ProgrammaticSEOPage(props: PageProps) {
  const params = await props.params;
  const [city, neighborhood, type] = params.slug || [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return []; }, setAll() {} } }
  );

  const { data: properties, error } = await supabase
    .schema('res_ddf' as any)
    .from('listings')
    .select('listing_key, address_street, address_city, list_price, bedrooms_total, bathrooms_total, photo_urls, mls_number')
    .ilike('address_city', `%${city || 'Ottawa'}%`)
    .eq('listing_status', 'Active')
    .limit(25);

  if (error || !properties || properties.length === 0) {
    notFound();
  }

  const h1 = `${neighborhood ? neighborhood.replace(/-/g, ' ') : city?.replace(/-/g, ' ')} ${type ? type.replace(/-/g, ' ') : 'Homes For Sale'}`;

  return (
    <main style={{ padding: '120px 48px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '16px' }}>{h1}</h1>
        <p style={{ fontSize: '18px', color: '#666', maxWidth: '800px', lineHeight: 1.6 }}>
          Browse all {properties.length}+ active MLS® listings below, updated hourly.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
        {properties.map((prop: any) => (
          <Link href={`/listing/${prop.listing_key}`} key={prop.listing_key} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ height: '220px', background: '#f5f5f5', backgroundImage: prop.photo_urls?.[0] ? `url(${prop.photo_urls[0]})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div style={{ padding: '24px' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#111', marginBottom: '8px' }}>
                  ${Number(prop.list_price).toLocaleString()}
                </div>
                <div style={{ fontSize: '15px', color: '#555', marginBottom: '16px', fontWeight: 600 }}>
                  {prop.address_street} • {prop.address_city}
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#888', fontWeight: 500 }}>
                  <span>{prop.bedrooms_total} Bed</span>
                  <span>{prop.bathrooms_total} Bath</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
