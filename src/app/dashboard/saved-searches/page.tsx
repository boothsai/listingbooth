'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SavedSearch {
  id: string;
  name: string;
  filters: {
    city?: string;
    min_price?: number;
    max_price?: number;
    beds?: number;
    baths?: number;
    type?: string;
  };
  email_alerts: boolean;
  created_at: string;
}

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('Ottawa');
  const [newMinPrice, setNewMinPrice] = useState('');
  const [newMaxPrice, setNewMaxPrice] = useState('');
  const [newBeds, setNewBeds] = useState('');
  const [newType, setNewType] = useState('');

  useEffect(() => {
    fetch('/api/saved-searches')
      .then(r => r.json())
      .then(d => setSearches(d.searches ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function createSearch() {
    if (!newName.trim()) return;
    const filters: any = { city: newCity };
    if (newMinPrice) filters.min_price = Number(newMinPrice);
    if (newMaxPrice) filters.max_price = Number(newMaxPrice);
    if (newBeds) filters.beds = Number(newBeds);
    if (newType) filters.type = newType;

    const res = await fetch('/api/saved-searches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, filters, email_alerts: true }),
    });
    if (res.ok) {
      const data = await res.json();
      setSearches(prev => [data.search, ...prev]);
      setShowCreate(false);
      setNewName(''); setNewMinPrice(''); setNewMaxPrice(''); setNewBeds(''); setNewType('');
    }
  }

  async function deleteSearch(id: string) {
    await fetch(`/api/saved-searches?id=${id}`, { method: 'DELETE' });
    setSearches(prev => prev.filter(s => s.id !== id));
  }

  function formatFilterLabel(filters: SavedSearch['filters']) {
    const parts = [];
    if (filters.city) parts.push(filters.city);
    if (filters.min_price) parts.push(`$${filters.min_price.toLocaleString()}+`);
    if (filters.max_price) parts.push(`up to $${filters.max_price.toLocaleString()}`);
    if (filters.beds) parts.push(`${filters.beds}+ beds`);
    if (filters.type) parts.push(filters.type);
    return parts.join(' · ') || 'All listings';
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>Saved Searches</h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>Get notified when new listings match your criteria.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={{
          padding: '10px 20px', borderRadius: '100px',
          background: '#da291c', color: 'white', border: 'none',
          fontSize: '14px', fontWeight: 800, cursor: 'pointer',
        }}>
          + New Search
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{
          padding: '24px', borderRadius: '16px', background: 'white',
          border: '1.5px solid #eee', marginBottom: '24px',
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800 }}>Create Saved Search</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Search name (e.g. 'Ottawa Condos')"
              style={{ flex: 2, minWidth: '200px', padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #eee', fontSize: '14px', fontWeight: 600 }} />
            <select value={newCity} onChange={e => setNewCity(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #eee', fontSize: '14px', fontWeight: 600, background: 'white' }}>
              {['Ottawa', 'Toronto', 'Mississauga', 'Oakville', 'Vaughan', 'Hamilton', 'London', 'Barrie'].map(c => <option key={c}>{c}</option>)}
            </select>
            <input value={newMinPrice} onChange={e => setNewMinPrice(e.target.value)} placeholder="Min $" type="number"
              style={{ width: '100px', padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #eee', fontSize: '14px', fontWeight: 600 }} />
            <input value={newMaxPrice} onChange={e => setNewMaxPrice(e.target.value)} placeholder="Max $" type="number"
              style={{ width: '100px', padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #eee', fontSize: '14px', fontWeight: 600 }} />
            <select value={newBeds} onChange={e => setNewBeds(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #eee', fontSize: '14px', fontWeight: 600, background: 'white' }}>
              <option value="">Beds</option>
              {['1', '2', '3', '4', '5'].map(b => <option key={b} value={b}>{b}+</option>)}
            </select>
            <select value={newType} onChange={e => setNewType(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #eee', fontSize: '14px', fontWeight: 600, background: 'white' }}>
              <option value="">Type</option>
              {['Residential', 'Condo', 'Townhouse', 'Semi-Detached'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={createSearch} style={{ padding: '10px 24px', borderRadius: '10px', background: '#111', color: 'white', border: 'none', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>
              Save Search
            </button>
            <button onClick={() => setShowCreate(false)} style={{ padding: '10px 24px', borderRadius: '10px', background: 'transparent', color: '#888', border: '1.5px solid #eee', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search list */}
      {loading ? (
        <div style={{ display: 'grid', gap: '12px' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: '80px', borderRadius: '16px', background: '#f0f0f0' }} />
          ))}
        </div>
      ) : searches.length === 0 ? (
        <div style={{ padding: '64px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1.5px solid #eee' }}>
          <p style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</p>
          <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 900, color: '#111' }}>No saved searches yet</h3>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#666' }}>Create a saved search to get email alerts when new listings match your criteria.</p>
          <button onClick={() => setShowCreate(true)} style={{ background: '#da291c', color: 'white', padding: '12px 24px', borderRadius: '100px', fontSize: '14px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
            Create Your First Search
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {searches.map(s => (
            <div key={s.id} style={{
              padding: '20px 24px', borderRadius: '16px',
              background: 'white', border: '1.5px solid #eee',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: '#111' }}>{s.name}</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#888', fontWeight: 600 }}>{formatFilterLabel(s.filters)}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '100px',
                  background: s.email_alerts ? 'rgba(34,197,94,0.1)' : '#f5f5f5',
                  color: s.email_alerts ? '#059669' : '#888',
                }}>
                  {s.email_alerts ? '🔔 Alerts ON' : '🔕 Alerts OFF'}
                </span>
                <Link href={`/buy?city=${s.filters.city ?? ''}&min_price=${s.filters.min_price ?? ''}&max_price=${s.filters.max_price ?? ''}&beds=${s.filters.beds ?? ''}&type=${s.filters.type ?? ''}`}
                  style={{ fontSize: '13px', fontWeight: 800, color: '#da291c', textDecoration: 'none' }}>
                  Run Search →
                </Link>
                <button onClick={() => deleteSearch(s.id)} style={{
                  background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '16px',
                  transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#da291c'}
                  onMouseLeave={e => e.currentTarget.style.color = '#ccc'}
                >✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
