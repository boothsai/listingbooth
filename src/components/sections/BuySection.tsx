'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Listing {
  id: string;
  listing_key: string;
  list_price: number;
  property_type: string | null;
  bedrooms_total: number | null;
  bathrooms_total: number | null;
  living_area: number | null;
  address_city: string | null;
  address_province: string | null;
  address_street: string | null;
  updated_at: string;
  days_on_market: number | null;
  photo_urls: string[] | null;
  is_active: boolean;
  public_remarks: string | null;
  listing_brokerage: string | null;
  vow_allowed: boolean;
  features?: string[];
}

function daysSince(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

function getBadge(l: Listing): { label: string; color: string } {
  const days = l.days_on_market ?? daysSince(l.updated_at);
  if (days <= 1) return { label: 'New Today', color: '#2563eb' };
  if (days <= 3) return { label: 'Just Listed', color: '#2563eb' };
  if (days > 30) return { label: 'Price Watch', color: '#059669' };
  return { label: 'Active', color: '#555' };
}

type FilterType = 'All' | 'Residential' | 'Condo' | 'Townhouse' | 'Semi-Detached';
const FILTERS: FilterType[] = ['All', 'Residential', 'Condo', 'Townhouse', 'Semi-Detached'];

export default function BuySection() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [city, setCity] = useState('Ottawa');
  const [searchInput, setSearchInput] = useState('');
  const [savedHomes, setSavedHomes] = useState<string[]>([]);
  const [authTrigger, setAuthTrigger] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  async function fetchListings(q?: string, type?: FilterType, cityOverride?: string) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (type && type !== 'All') params.set('type', type);
      params.set('city', cityOverride ?? city);
      params.set('limit', '12');
      if (minPrice) params.set('min_price', minPrice);
      if (maxPrice) params.set('max_price', maxPrice);
      if (beds) params.set('beds', beds);
      if (baths) params.set('baths', baths);
      const res = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setListings(data.listings ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }

  async function fetchFavorites() {
    try {
      const res = await fetch('/api/favorites');
      if (res.ok) {
        const data = await res.json();
        setSavedHomes(data.favorites || []);
      }
    } catch {}
  }

  async function toggleSave(e: React.MouseEvent, listing_key: string) {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic UI update
    const isSaved = savedHomes.includes(listing_key);
    setSavedHomes(prev => isSaved ? prev.filter(k => k !== listing_key) : [...prev, listing_key]);

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_key })
      });
      if (res.status === 401) {
        // Not logged in, force auth modal
        setSavedHomes(prev => isSaved ? [...prev, listing_key] : prev.filter(k => k !== listing_key));
        window.location.href = '/?auth=1';
      }
    } catch {
      // Revert on hard failure
      setSavedHomes(prev => isSaved ? [...prev, listing_key] : prev.filter(k => k !== listing_key));
    }
  }

  useEffect(() => { 
    fetchListings(); 
    fetchFavorites();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section id="buy" style={{ backgroundColor: '#fff', padding: '80px 0', borderTop: '1px solid #f0f0f0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: '#da291c', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Live CREA DDF Data</p>
          <h2 style={{ margin: '0 0 12px', fontSize: '42px', fontWeight: 900, letterSpacing: '-1.5px', color: '#111', lineHeight: 1.0 }}>Find Your Next Home.</h2>
          <p style={{ margin: 0, fontSize: '17px', color: '#666', maxWidth: '560px', lineHeight: 1.6 }}>
            Powered by the CREA DDF feed — real listings, updated daily.
          </p>
        </div>

        {/* Search + city */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: '44px', border: '1.5px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden', flex: 1, minWidth: '240px', background: 'white' }}>
            <div style={{ padding: '0 12px', color: '#bbb' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchListings(searchInput, activeFilter)}
              placeholder="Search address, city, or neighbourhood..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', fontWeight: 500, color: '#111', background: 'transparent' }}
            />
          </div>
          <select value={city} onChange={e => { setCity(e.target.value); fetchListings(searchInput, activeFilter, e.target.value); }}
            style={{ height: '44px', padding: '0 16px', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: '#333', background: 'white', cursor: 'pointer' }}>
            {['Ottawa', 'Toronto', 'Vancouver', 'Calgary', 'Montreal', 'Mississauga'].map(c => <option key={c}>{c}</option>)}
          </select>
          <button onClick={() => fetchListings(searchInput, activeFilter)} style={{ height: '44px', padding: '0 28px', background: '#da291c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', letterSpacing: '0.04em' }}>
            Search
          </button>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ height: '44px', padding: '0 16px', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#555', background: 'white', cursor: 'pointer' }}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="dom">Days on Market</option>
          </select>
        </div>

        {/* Type pills + Filter toggle */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => { setActiveFilter(f); fetchListings(searchInput, f); }} style={{
              padding: '7px 18px', borderRadius: '100px',
              border: activeFilter === f ? '2px solid #da291c' : '1.5px solid #e5e5e5',
              background: activeFilter === f ? '#da291c' : 'white',
              color: activeFilter === f ? 'white' : '#555',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            }}>{f}</button>
          ))}
          <button onClick={() => setShowFilters(!showFilters)} style={{
            padding: '7px 18px', borderRadius: '100px',
            border: showFilters ? '2px solid #111' : '1.5px solid #e5e5e5',
            background: showFilters ? '#111' : 'white',
            color: showFilters ? 'white' : '#555',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>
            Filters {(minPrice || maxPrice || beds || baths) ? '•' : ''}
          </button>
        </div>

        {/* Advanced Filter Bar */}
        {showFilters && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center', padding: '20px', background: '#fafafa', borderRadius: '12px', border: '1.5px solid #eee' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Price</span>
              <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                style={{ width: '110px', height: '38px', padding: '0 12px', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '14px', fontWeight: 600, background: 'white' }} />
              <span style={{ color: '#ccc' }}>—</span>
              <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                style={{ width: '110px', height: '38px', padding: '0 12px', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '14px', fontWeight: 600, background: 'white' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Beds</span>
              <select value={beds} onChange={e => setBeds(e.target.value)}
                style={{ height: '38px', padding: '0 12px', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '14px', fontWeight: 600, background: 'white', cursor: 'pointer' }}>
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Baths</span>
              <select value={baths} onChange={e => setBaths(e.target.value)}
                style={{ height: '38px', padding: '0 12px', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '14px', fontWeight: 600, background: 'white', cursor: 'pointer' }}>
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
            <button onClick={() => fetchListings(searchInput, activeFilter)} style={{
              height: '38px', padding: '0 24px', background: '#da291c', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
            }}>Apply</button>
            <button onClick={() => { setMinPrice(''); setMaxPrice(''); setBeds(''); setBaths(''); fetchListings(searchInput, activeFilter); }} style={{
              height: '38px', padding: '0 16px', background: 'transparent', color: '#888', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            }}>Clear</button>
          </div>
        )}

        {/* Listings grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ borderRadius: '16px', border: '1.5px solid #eee', height: '320px', background: 'linear-gradient(90deg, #f5f5f5 25%, #efefef 37%, #f5f5f5 63%)', backgroundSize: '400% 100%' }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#fef2f2', borderRadius: '16px', border: '1px solid rgba(218,41,28,0.15)' }}>
            <p style={{ fontSize: '16px', color: '#da291c', fontWeight: 700 }}>⚠️ {error}</p>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '8px' }}>The DDF database may still be syncing. Check back shortly.</p>
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#fafafa', borderRadius: '16px', border: '1.5px solid #eee' }}>
            <p style={{ fontSize: '16px', color: '#555', fontWeight: 700 }}>No listings found for the current filters.</p>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '8px' }}>Try changing the city or adjusting your filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {[...listings].sort((a, b) => {
              if (sortBy === 'price_asc') return a.list_price - b.list_price;
              if (sortBy === 'price_desc') return b.list_price - a.list_price;
              if (sortBy === 'dom') return (a.days_on_market ?? daysSince(a.updated_at)) - (b.days_on_market ?? daysSince(b.updated_at));
              return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(); // newest
            }).map(l => {
              const badge = getBadge(l);
              const dom = l.days_on_market ?? daysSince(l.updated_at);
              return (
                <Link key={l.listing_key} href={`/listing/${encodeURIComponent(l.listing_key)}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ borderRadius: '16px', border: '1.5px solid #eee', background: 'white', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.3s, box-shadow 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {/* Photo */}
                  <div style={{ height: '200px', background: '#f0f0f0', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {l.photo_urls?.[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={l.photo_urls[0]} alt={l.address_street ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    )}
                    <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: badge.color, color: 'white', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{badge.label}</div>
                    
                    {/* Interactive Heart Button */}
                    <button 
                      onClick={(e) => toggleSave(e, l.listing_key)}
                      style={{ position: 'absolute', top: '12px', right: '12px', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transition: 'transform 0.2s', transform: 'scale(1)' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={savedHomes.includes(l.listing_key) ? '#da291c' : 'none'} stroke={savedHomes.includes(l.listing_key) ? '#da291c' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </button>
                    
                    <div style={{ position: 'absolute', bottom: '12px', left: '12px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '100px' }}>{dom === 0 ? 'Today' : `${dom}d ago`}</div>
                  </div>
                  {/* Info */}
                  <div style={{ padding: '16px 20px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span style={{ fontSize: '24px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>{formatPrice(l.list_price)}</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#888', padding: '4px 10px', border: '1px solid #eee', borderRadius: '100px' }}>{l.property_type ?? 'Property'}</span>
                    </div>
                    <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#555', fontWeight: 500 }}>{l.address_street ?? 'Address unavailable'}{l.address_city ? `, ${l.address_city}` : ''}</p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#555', fontWeight: 600, borderTop: '1px solid #f5f5f5', paddingTop: '10px', marginBottom: '10px' }}>
                      {(l.bedrooms_total ?? 0) > 0 && <span>🛏 {l.bedrooms_total} bd</span>}
                      {(l.bathrooms_total ?? 0) > 0 && <span>🚿 {l.bathrooms_total} ba</span>}
                      {l.living_area && <span>📐 {Math.round(l.living_area).toLocaleString()} sqft</span>}
                    </div>
                    {/* Visual AI Tags Strip */}
                    {l.features && l.features.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        {l.features.slice(0, 3).map((f: string) => (
                          <span key={f} style={{ fontSize: '10px', fontWeight: 800, padding: '4px 8px', backgroundColor: 'rgba(218,41,28,0.06)', color: '#da291c', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            ✨ {f.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* DDF Compliance Footer — required by CREA DDF rules */}
                  <div style={{ margin: '10px 20px 16px', padding: '8px 12px', borderTop: '1px solid #f0f0f0', backgroundColor: '#fafafa', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <p style={{ margin: 0, fontSize: '10px', color: '#999', lineHeight: 1.5, fontWeight: 500 }}>
                      <strong style={{ color: '#da291c', fontWeight: 700 }}>Brokered by eXp Realty</strong>
                      {l.listing_brokerage ? <> · {l.listing_brokerage}</> : ''}
                      {' '}· Data © CREA DDF®
                    </p>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#da291c', whiteSpace: 'nowrap', flexShrink: 0 }}>View Details →</span>
                  </div>
                </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* View all */}
        {!loading && !error && listings.length > 0 && (
          <div style={{ marginTop: '48px', textAlign: 'center' }}>
            <button onClick={e => { e.preventDefault(); fetchListings(searchInput, activeFilter); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#da291c', color: 'white', padding: '16px 40px', borderRadius: '8px', fontSize: '16px', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(218,41,28,0.35)' }}>
              View More Listings →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
