import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function SharedCollectionPage({ params }: { params: { token: string } }) {
  const token = (params).token;

  // 1. Fetch collection by secure token (Bypassing RLS since it's a public share)
  const { data: collection, error: colError } = await supabaseAdmin
    .from('user_collections')
    .select('*')
    .eq('share_token', token)
    .single();

  if (colError || !collection) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px' }}>💔</p>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#111', marginBottom: '8px' }}>Link Expired or Invalid</h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>This shared collection token does not exist.</p>
          <Link href="/" style={{ padding: '12px 24px', background: '#111', color: 'white', borderRadius: '100px', fontWeight: 800, textDecoration: 'none' }}>
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // 2. Fetch all properties in this collection
  const { data: items } = await supabaseAdmin
    .from('user_collection_items')
    .select('*')
    .eq('collection_id', collection.id)
    .order('position', { ascending: true });

  const safeItems = items || [];

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', color: '#111' }}>
      {/* Premium Header */}
      <header style={{ background: 'white', padding: '24px 48px', borderBottom: '1.5px solid #eee', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 800, color: '#da291c', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Shared Collaboration Room
            </p>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900, letterSpacing: '-1px' }}>
              {collection.name}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#888' }}>
              {safeItems.length} properties
            </p>
            <Link href={`/buy`} style={{ padding: '12px 24px', background: '#111', color: 'white', borderRadius: '100px', fontSize: '14px', fontWeight: 800, textDecoration: 'none' }}>
              Create Your Own
            </Link>
          </div>
        </div>
      </header>

      {/* Grid Content */}
      <main style={{ padding: '48px', maxWidth: '1400px', margin: '0 auto' }}>
        {safeItems.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1.5px solid #eee' }}>
            <p style={{ fontSize: '40px', marginBottom: '16px' }}>🏡</p>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 900 }}>Empty Collection</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>The owner hasn't added any properties to this collection yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {safeItems.map(item => (
              <div key={item.id} style={{
                background: 'white', borderRadius: '24px', overflow: 'hidden',
                border: '1.5px solid #eee', transition: 'all 0.3s',
              }}>
                {/* Photo Header */}
                <div style={{ height: '220px', background: '#f5f5f5', position: 'relative' }}>
                  {item.photo_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.photo_url} alt="Property" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>🏡</div>
                  )}
                  <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 800, backdropFilter: 'blur(4px)' }}>
                    {item.listing_key}
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: '24px' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 900, letterSpacing: '-1px' }}>
                    {item.price ? formatPrice(item.price) : 'Price Undisclosed'}
                  </p>
                  <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#666', fontWeight: 500 }}>
                    {item.address || 'Address hidden by owner'}
                  </p>
                  
                  {item.notes && (
                    <div style={{ background: '#fafafa', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1.5px solid #eee' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 800, color: '#da291c', textTransform: 'uppercase' }}>Owner Notes</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#333', fontStyle: 'italic' }}>"{item.notes}"</p>
                    </div>
                  )}

                  {/* Voting Mockup Actions */}
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1.5px solid #eee', paddingTop: '16px', marginTop: '16px' }}>
                    <button style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#fafafa', border: '1.5px solid #eee', fontSize: '14px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>
                      👎 Pass
                    </button>
                    <button style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#da291c', color: 'white', border: 'none', fontSize: '14px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>
                      👍 Love it
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
