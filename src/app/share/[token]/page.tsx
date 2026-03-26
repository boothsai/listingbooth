export const dynamic = 'force-dynamic';
export const revalidate = 3600;
export const runtime = 'edge';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import RegistrationWall from '@/components/RegistrationWall';
import SaveListingButton from '@/components/SaveListingButton';
import TrueCostCalculator from '@/components/TrueCostCalculator';
import BeforeYouOfferChecklist from '@/components/BeforeYouOfferChecklist';
import NeighborhoodVibeCard from '@/components/NeighborhoodVibeCard';
import RecommendationCarousel from '@/components/RecommendationCarousel';


interface Props {
  params: Promise<{ token: string }>;
}

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );

  const { data: linkInfo } = await supabase.schema('core_logic' as any)
    .from('shared_links')
    .select('listing_key')
    .eq('share_token', token)
    .single();

  if (!linkInfo) return { title: 'Curated Collection — ListingBooth' };

  const { data: l } = await supabase
    .schema('res_ddf' as any)
    .from('listings')
    .select('title, address_street, list_price, photo_urls, public_remarks')
    .eq('listing_key', linkInfo.listing_key)
    .single();

  if (!l) return { title: 'Curated Collection — ListingBooth' };

  const price = formatPrice(l.list_price);
  const desc = l.public_remarks ? l.public_remarks.substring(0, 150) + '...' : 'View this beautiful property.';

  return {
    title: `${l.address_street} | Curated For You`,
    description: desc,
    openGraph: {
      title: `${l.address_street} for ${price}`,
      description: desc,
      images: l.photo_urls?.[0] ? [{ url: l.photo_urls[0] }] : []
    }
  };
}

export default async function SharedListingPage({ params }: Props) {
  const { token } = await params;
  const cookieStore = await cookies();
  
  // Use Service Role to bypass RLS and fetch the shared link data + DDF property
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  // 1. Resolve the Share Token
  const { data: linkInfo } = await supabase.schema('core_logic' as any)
    .from('shared_links')
    .select('listing_key, agent_id, auth.users!agent_id(email, raw_user_meta_data)')
    .eq('share_token', token)
    .single();

  if (!linkInfo) notFound();
  const info = linkInfo as any;

  // Increment view counter async
  try { await supabase.schema('core_logic' as any).rpc('increment_share_view', { t_id: token }); } catch (e) {}

  // 2. Fetch the Listing
  const { data: l } = await supabase
    .schema('res_ddf' as any)
    .from('listings')
    .select('*')
    .eq('listing_key', info.listing_key)
    .single();
  if (!l) notFound();

  // Fetch AI recommendations via the dedicated API route (not a Supabase RPC)
  let recs: any[] = [];
  try {
    const recRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/recommendations/${info.listing_key}`);
    if (recRes.ok) {
      const recData = await recRes.json();
      recs = Array.isArray(recData.recommendations) ? recData.recommendations : [];
    }
  } catch (e) {
    // Non-fatal — page renders fine without recommendations
  }


  const agentName = info.users?.raw_user_meta_data?.full_name || info.users?.email || 'Your Agent';
  const photos = l.photo_urls ?? [];
  const mainPhoto = photos[0];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: l.address_street,
    description: l.public_remarks || '',
    image: mainPhoto ? [mainPhoto] : [],
    offers: {
      '@type': 'Offer',
      price: l.list_price,
      priceCurrency: l.list_price_currency || 'CAD',
    },
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `https://listingbooth.com/share/${token}#schedule`,
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform'
        ]
      },
      result: {
        '@type': 'Reservation',
        name: 'Schedule a Tour'
      }
    }
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <RegistrationWall token={token} agentName={agentName} />
      
      {/* ── Co-Branded Header ── */}
      <div style={{ backgroundColor: '#111', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-transparent.png" alt="ListingBooth" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
          <span style={{ fontSize: '18px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>listing<span style={{ color: '#da291c' }}>booth</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '100px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#da291c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>
            {agentName.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>Curated for you by <strong style={{color: 'white'}}>{agentName}</strong></span>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 40px 80px' }}>

        {/* ── Photo gallery ── */}
        <div style={{ borderRadius: '20px', overflow: 'hidden', marginBottom: '40px', background: '#111', height: '480px', position: 'relative' }}>
          {mainPhoto && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={mainPhoto} alt={l.address_street ?? 'Property'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          {photos.length > 1 && (
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '13px', fontWeight: 700, padding: '8px 16px', borderRadius: '100px' }}>
              📷 {photos.length} photos
            </div>
          )}
        </div>

        {/* ── Thumbnail strip ── */}
        {photos.length > 1 && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', overflowX: 'auto', paddingBottom: '4px' }}>
            {photos.slice(1, 8).map((p: string, i: number) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={i} src={p} alt="" style={{ width: '140px', height: '90px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} />
            ))}
          </div>
        )}

        {/* ── Main content grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '48px', alignItems: 'start' }}>

          {/* Left: listing details */}
          <div>
            <div style={{ marginBottom: '24px' }}>
              <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#da291c', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {l.property_type ?? 'Property'} · For Sale
              </p>
              <h1 style={{ margin: '0 0 8px', fontSize: '48px', fontWeight: 900, letterSpacing: '-2px', color: '#111', lineHeight: 1 }}>
                {formatPrice(l.list_price)}
              </h1>
              <p style={{ margin: '0 0 16px', fontSize: '18px', color: '#555', fontWeight: 500 }}>
                {l.address_street}{l.address_unit ? `, Unit ${l.address_unit}` : ''}, {l.address_city}, {l.address_province}
              </p>
              
              {/* Gemini Vision Semantic Tags */}
              {l.features && l.features.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ padding: '6px 12px', background: 'rgba(218,41,28,0.1)', color: '#da291c', borderRadius: '100px', fontSize: '12px', fontWeight: 800, border: '1px solid rgba(218,41,28,0.2)' }}>
                    ✨ AI Verified
                  </div>
                  {l.features.map((f: string) => (
                    <div key={f} style={{ padding: '6px 12px', background: '#f5f5f5', color: '#444', borderRadius: '100px', fontSize: '12px', fontWeight: 700, border: '1px solid #e5e5e5', textTransform: 'capitalize' }}>
                      {f.replace(/_/g, ' ')}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0', marginBottom: '40px', background: 'white', border: '1.5px solid #eee', borderRadius: '14px', overflow: 'hidden' }}>
              {[
                { label: 'Bedrooms', value: l.bedrooms_total ?? '—' },
                { label: 'Bathrooms', value: l.bathrooms_total ?? '—' },
                { label: 'Sq Ft', value: l.living_area ? Math.round(l.living_area).toLocaleString() : '—' },
                { label: 'Days on Market', value: l.days_on_market ?? '—' },
              ].map((s, i, arr) => (
                <div key={s.label} style={{ flex: 1, padding: '20px 16px', textAlign: 'center', borderRight: i < arr.length - 1 ? '1px solid #eee' : 'none' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 900, color: '#111', letterSpacing: '-1px' }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {(l.public_remarks || l.description) && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>About This Property</h2>
                <p style={{ margin: 0, fontSize: '15px', color: '#555', lineHeight: 1.7 }}>{l.public_remarks ?? l.description}</p>
              </div>
            )}
          </div>

          {/* Right: The Collaborative Moat card */}
          <div style={{ position: 'sticky', top: '100px' }}>
            
            <div style={{ background: 'white', border: '1.5px solid #eee', borderRadius: '20px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#da291c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900, marginBottom: '12px', boxShadow: '0 4px 12px rgba(218,41,28,0.3)' }}>
                  {agentName.charAt(0).toUpperCase()}
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 900, color: '#111' }}>{agentName}</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#888', fontWeight: 600 }}>eXp Realty Brokerage</p>
              </div>
{recs && recs.length > 0 && (
        <RecommendationCarousel recommendations={recs.map((r: any) => ({
          listing_key: r.listing_key,
          title: r.title,
          price: r.price,
          photo_url: r.photo_url,
          address: r.address
        }))} />
      )}
              <a href="#contact" style={{ display: 'block', width: '100%', padding: '16px', background: '#111', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', marginBottom: '12px', textAlign: 'center', textDecoration: 'none' }}>
                💬 Chat with {agentName.split(' ')[0]}
              </a>
              <a href="#contact" style={{ display: 'block', width: '100%', padding: '16px', background: 'white', color: '#111', border: '1.5px solid #e5e5e5', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>
                📅 Schedule a Tour
              </a>
            </div>

            {/* Competitive Moat Features explicitly retained for the Client */}
            {l.address_city && <NeighborhoodVibeCard city={l.address_city} community={l.community_name} />}
            <div style={{ height: '16px' }} />
            <TrueCostCalculator listPrice={l.list_price} />
            <div style={{ height: '16px' }} />
            <BeforeYouOfferChecklist />
          </div>
        </div>
      </div>
    </main>
  );
}
