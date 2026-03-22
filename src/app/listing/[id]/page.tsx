import { notFound } from 'next/navigation';
import { getListingById } from '@/lib/supabase/ddf';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import ListingCTA from '@/components/ListingCTA';

interface Props {
  params: Promise<{ id: string }>;
}

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return { title: 'Listing Not Found — ListingBooth' };
  const city = listing.address_city ?? 'Canada';
  const price = formatPrice(listing.list_price);
  return {
    title: `${listing.address_street ?? 'Property'} in ${city} — ${price} | ListingBooth`,
    description: listing.public_remarks?.slice(0, 160) ?? `${listing.property_type} for sale in ${city}.`,
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const l = await getListingById(id);
  if (!l) notFound();

  const photos = l.photo_urls ?? [];
  const mainPhoto = photos[0];

  // VOW Gateway Protection (Server-Side)
  // Verifying if the user has a valid Supabase Google SSO session before exposing restricted TRREB fields
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );
  const { data: { user } } = await supabase.auth.getUser();

  // If unauthenticated, the component locks down sold_price and history
  const isVowLocked = !user && ((l as any).sold_price !== null || l.listing_status === 'Sold');

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {/* ── Breadcrumb nav ── */}
      <div style={{ borderBottom: '1px solid #eee', backgroundColor: 'white', padding: '14px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#888', fontWeight: 500 }}>
          <Link href="/" style={{ color: '#da291c', textDecoration: 'none', fontWeight: 700 }}>ListingBooth</Link>
          <span>›</span>
          <Link href="/#buy" style={{ color: '#888', textDecoration: 'none' }}>{l.address_city ?? 'Listings'}</Link>
          <span>›</span>
          <span style={{ color: '#111', fontWeight: 600 }}>{l.address_street ?? l.listing_key}</span>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 40px 80px' }}>

        {/* ── Photo gallery ── */}
        <div style={{ borderRadius: '20px', overflow: 'hidden', marginBottom: '40px', background: '#111', height: '480px', position: 'relative' }}>
          {mainPhoto ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={mainPhoto} alt={l.address_street ?? 'Property'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <p style={{ color: '#555', fontSize: '14px', margin: 0 }}>No photos available</p>
            </div>
          )}
          {/* Photo count badge */}
          {photos.length > 1 && (
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '13px', fontWeight: 700, padding: '8px 16px', borderRadius: '100px' }}>
              📷 {photos.length} photos
            </div>
          )}
          {/* Status badge */}
          <div style={{ position: 'absolute', top: '20px', left: '20px', background: l.is_active ? '#22c55e' : '#888', color: 'white', fontSize: '12px', fontWeight: 800, padding: '6px 14px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {l.is_active ? 'Active' : 'Inactive'}
          </div>
        </div>

        {/* ── Thumbnail strip ── */}
        {photos.length > 1 && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', overflowX: 'auto', paddingBottom: '4px' }}>
            {photos.slice(1, 8).map((p, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={i} src={p} alt="" style={{ width: '140px', height: '90px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0, cursor: 'pointer' }} />
            ))}
          </div>
        )}

        {/* ── Main content grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '48px', alignItems: 'start' }}>

          {/* Left: listing details */}
          <div>
            {/* Price + type */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#da291c', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {l.property_type ?? 'Property'} · For Sale
              </p>
              <h1 style={{ margin: '0 0 8px', fontSize: '48px', fontWeight: 900, letterSpacing: '-2px', color: '#111', lineHeight: 1 }}>
                {formatPrice(l.list_price)}
              </h1>
              <p style={{ margin: 0, fontSize: '18px', color: '#555', fontWeight: 500 }}>
                {l.address_street}{l.address_unit ? `, Unit ${l.address_unit}` : ''}, {l.address_city}, {l.address_province} {l.address_postal_code}
              </p>
            </div>

            {/* Key stats bar */}
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

            {/* Description */}
            {(l.public_remarks || l.description) && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>About This Property</h2>
                <p style={{ margin: 0, fontSize: '15px', color: '#555', lineHeight: 1.7 }}>{l.public_remarks ?? l.description}</p>
              </div>
            )}

            {/* VOW Gateway: Sold Data UX Lock */}
            <div style={{ marginBottom: '40px', position: 'relative' }}>
              <h2 style={{ margin: '0 0 20px', fontSize: '22px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>Pricing & History</h2>
              
              <div style={{ background: 'white', border: '1.5px solid #eee', borderRadius: '14px', padding: '24px', overflow: 'hidden', position: 'relative' }}>
                {isVowLocked ? (
                  <>
                    {/* Blurred mock data to tease the user */}
                    <div style={{ filter: 'blur(8px)', opacity: 0.4, pointerEvents: 'none' }}>
                      <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Sold Price</p>
                      <p style={{ margin: '0 0 24px', fontSize: '32px', fontWeight: 900, color: '#111' }}>$1,250,000</p>
                      <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Sales History</p>
                      <div style={{ height: '60px', background: '#f5f5f5', borderRadius: '8px' }}></div>
                    </div>
                    {/* The Lock Overlay */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)' }}>
                      <div style={{ background: 'white', padding: '24px 32px', borderRadius: '16px', boxShadow: '0 12px 32px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '300px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</div>
                        <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 900, color: '#111' }}>Unlock Sold Data</h3>
                        <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#555', lineHeight: 1.5 }}>
                          CREA and TRREB regulations require you to create a free account to view actual sold prices and property history.
                        </p>
                        <a href="/?auth=1" style={{ display: 'inline-block', background: '#da291c', color: 'white', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 12px rgba(218,41,28,0.3)', transition: 'background-color 0.2s' }}>
                          Sign In with Google
                        </a>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    {/* Authenticated User -> Show Real Data */}
                    {(l as any).sold_price ? (
                      <>
                        <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#22c55e', textTransform: 'uppercase', fontWeight: 800 }}>Sold For</p>
                        <p style={{ margin: '0 0 24px', fontSize: '36px', fontWeight: 900, color: '#111', letterSpacing: '-1px' }}>{formatPrice((l as any).sold_price)}</p>
                      </>
                    ) : (
                      <p style={{ margin: 0, fontSize: '14px', color: '#555', fontWeight: 500 }}>No recent sold history available for this active property.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Property details grid */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ margin: '0 0 20px', fontSize: '22px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>Property Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', background: 'white', border: '1.5px solid #eee', borderRadius: '14px', overflow: 'hidden' }}>
                {[
                  { label: 'Listing Key', value: l.listing_key },
                  { label: 'MLS® Number', value: l.mls_number ?? '—' },
                  { label: 'Property Type', value: l.property_type ?? '—' },
                  { label: 'Property Sub-Type', value: l.property_sub_type ?? '—' },
                  { label: 'Address', value: l.address_street ?? '—' },
                  { label: 'City', value: l.address_city ?? '—' },
                  { label: 'Province', value: l.address_province ?? '—' },
                  { label: 'Postal Code', value: l.address_postal_code ?? '—' },
                  { label: 'Bedrooms', value: l.bedrooms_total?.toString() ?? '—' },
                  { label: 'Bathrooms', value: l.bathrooms_total?.toString() ?? '—' },
                  { label: 'Living Area', value: l.living_area ? `${Math.round(l.living_area).toLocaleString()} sqft` : '—' },
                  { label: 'Lot Size', value: l.lot_size_area ? `${l.lot_size_area.toLocaleString()} sqft` : '—' },
                  { label: 'Data Source', value: l.data_source ?? 'CREA DDF®' },
                  { label: 'Last Updated', value: new Date(l.updated_at).toLocaleDateString('en-CA') },
                ].map((row, i) => (
                  <div key={row.label} style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5f5', borderRight: i % 2 === 0 ? '1px solid #f5f5f5' : 'none', backgroundColor: i % 4 < 2 ? 'white' : '#fafafa' }}>
                    <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{row.label}</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111' }}>{row.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* DDF Compliance footer */}
            <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '12px', padding: '16px 20px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#999', lineHeight: 1.6 }}>
                <strong style={{ color: '#da291c' }}>Brokered by eXp Realty Canada.</strong>{' '}
                {l.listing_brokerage ? `Listing provided by ${l.listing_brokerage}. ` : ''}
                Data © {new Date().getFullYear()} CREA. Listing information last updated {new Date(l.updated_at).toLocaleDateString('en-CA')}.
                The trademarks MLS®, Multiple Listing Service®, REALTOR®, REALTORS® and the associated logos are controlled by CREA.
                Used under license. Data distributed by CREA's Data Distribution Facility (DDF®).
              </p>
            </div>
          </div>

          {/* Right: interactive CTA card (client component) */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <ListingCTA
              listingKey={l.listing_key}
              address={`${l.address_street ?? ''}${l.address_city ? `, ${l.address_city}` : ''}`}
              price={formatPrice(l.list_price)}
              agentName={l.listing_agent_name}
              brokerage={l.listing_brokerage}
              virtualTourUrl={l.virtual_tour_url}
            />

            {/* Map */}
            {l.latitude && l.longitude && (
              <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1.5px solid #eee', height: '200px' }}>
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${l.longitude - 0.01},${l.latitude - 0.008},${l.longitude + 0.01},${l.latitude + 0.008}&layer=mapnik&marker=${l.latitude},${l.longitude}`}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Property location"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
