'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Collection {
  id: string;
  name: string;
  items: { listing_key: string; notes?: string; photo_url?: string; address?: string; price?: number }[];
  created_at: string;
}

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetch('/api/collections')
      .then(r => r.json())
      .then(d => setCollections(d.collections ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function createCollection() {
    if (!newName.trim()) return;
    const res = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    });
    if (res.ok) {
      const data = await res.json();
      setCollections(prev => [{ ...data.collection, items: [] }, ...prev]);
      setShowCreate(false);
      setNewName('');
    }
  }

  async function deleteCollection(id: string) {
    await fetch(`/api/collections?id=${id}`, { method: 'DELETE' });
    setCollections(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>Collections</h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>Organize properties into shareable boards for comparison and collaboration.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={{
          padding: '10px 20px', borderRadius: '100px',
          background: '#da291c', color: 'white', border: 'none',
          fontSize: '14px', fontWeight: 800, cursor: 'pointer',
        }}>
          + New Collection
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{
          padding: '24px', borderRadius: '16px', background: 'white',
          border: '1.5px solid #eee', marginBottom: '24px',
          display: 'flex', gap: '12px', alignItems: 'center',
        }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Collection name (e.g. 'Dream Homes', 'Investment Properties')"
            onKeyDown={e => e.key === 'Enter' && createCollection()}
            style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #eee', fontSize: '15px', fontWeight: 600 }} />
          <button onClick={createCollection} style={{ padding: '12px 24px', borderRadius: '10px', background: '#111', color: 'white', border: 'none', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>
            Create
          </button>
          <button onClick={() => setShowCreate(false)} style={{ padding: '12px 16px', borderRadius: '10px', background: 'transparent', color: '#888', border: '1.5px solid #eee', fontSize: '14px', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      )}

      {/* Collections grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: '240px', borderRadius: '20px', background: '#f0f0f0' }} />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div style={{ padding: '64px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1.5px solid #eee' }}>
          <p style={{ fontSize: '40px', marginBottom: '16px' }}>📁</p>
          <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 900, color: '#111' }}>No collections yet</h3>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#666', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
            Create a collection to organize properties into shareable boards — perfect for comparing neighborhoods and collaborating with your agent.
          </p>
          <button onClick={() => setShowCreate(true)} style={{ background: '#da291c', color: 'white', padding: '12px 24px', borderRadius: '100px', fontSize: '14px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
            Create Your First Collection
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {collections.map(c => (
            <div key={c.id} style={{
              borderRadius: '20px', overflow: 'hidden',
              background: 'white', border: '1.5px solid #eee',
              transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Photo mosaic header */}
              <div style={{ height: '120px', background: '#f5f5f5', display: 'flex', overflow: 'hidden' }}>
                {c.items.length > 0 ? c.items.slice(0, 3).map((item, i) => (
                  item.photo_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img key={i} src={item.photo_url} alt="" style={{ flex: 1, objectFit: 'cover', borderRight: i < 2 ? '2px solid white' : 'none' }} />
                  ) : (
                    <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', background: '#eee', borderRight: i < 2 ? '2px solid white' : 'none' }}>🏡</div>
                  )
                )) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '14px' }}>
                    No properties yet
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>{c.name}</h3>
                  <button onClick={() => deleteCollection(c.id)} style={{
                    background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '14px',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = '#da291c'}
                    onMouseLeave={e => e.currentTarget.style.color = '#ccc'}
                  >✕</button>
                </div>
                <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#888', fontWeight: 600 }}>
                  {c.items.length} {c.items.length === 1 ? 'property' : 'properties'}
                </p>

                {/* Item preview pills */}
                {c.items.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {c.items.slice(0, 3).map(item => (
                      <Link key={item.listing_key} href={`/listing/${item.listing_key}`}
                        style={{
                          fontSize: '11px', fontWeight: 700, color: '#555',
                          padding: '4px 10px', background: '#f5f5f5', borderRadius: '100px',
                          textDecoration: 'none',
                        }}>
                        {item.price ? formatPrice(item.price) : item.listing_key.slice(0, 8)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
