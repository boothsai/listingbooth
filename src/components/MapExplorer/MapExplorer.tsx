'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const ExplorerMap = dynamic(() => import('@/components/MapExplorer/ExplorerMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f7f5' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e5e5e5', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#888', fontSize: 14, fontWeight: 600 }}>Loading map...</p>
      </div>
      <style dangerouslySetInnerHTML={{__html: `@keyframes spin { to { transform: rotate(360deg); } }`}} />
    </div>
  ),
});

export interface ListingMarker {
  listing_key: string;
  latitude: number;
  longitude: number;
  list_price: number;
  close_price: number | null;
  property_type: string;
  bedrooms_total: number;
  bathrooms_total: number;
  photo_urls: string[];
  address_street: string;
  address_city: string;
  listing_status: string;
  listing_contract_date: string;
  living_area: number | null;
  days_on_market: number | null;
  description?: string | null;
  maintenance_fee?: number | null;
  _vow_locked?: boolean;
}

export interface Filters {
  minPrice: number | null;
  maxPrice: number | null;
  beds: string;
  baths: string;
  propertyType: string;
  sort: string;
}

interface CityConfig {
  name: string;
  center: [number, number];
  zoom: number;
}

const CITIES: CityConfig[] = [
  { name: 'Ottawa', center: [45.4215, -75.6972], zoom: 13 },
  { name: 'Toronto', center: [43.6532, -79.3832], zoom: 12 },
  { name: 'Mississauga', center: [43.5890, -79.6441], zoom: 13 },
  { name: 'Hamilton', center: [43.2557, -79.8711], zoom: 13 },
  { name: 'Brampton', center: [43.7315, -79.7624], zoom: 13 },
];

const PRICE_RANGES = [
  { label: 'Any', min: null, max: null },
  { label: 'Under $300K', min: null, max: 300000 },
  { label: '$300–500K', min: 300000, max: 500000 },
  { label: '$500–800K', min: 500000, max: 800000 },
  { label: '$800K–1.2M', min: 800000, max: 1200000 },
  { label: '$1.2M+', min: 1200000, max: null },
];

const PROPERTY_TYPES = ['All', 'Detached', 'Condo', 'Townhouse', 'Semi-Detached'];

function formatPrice(n: number) {
  if (!n) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(n / 1000)}K`;
}

function daysAgo(dateStr: string) {
  if (!dateStr) return null;
  const d = Math.ceil((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d <= 7) return `${d}d ago`;
  return `${Math.ceil(d / 7)}w ago`;
}

function getTypeColor(type: string): string {
  const t = (type || '').toLowerCase();
  if (t.includes('condo') || t.includes('apartment')) return '#8b5cf6';
  if (t.includes('town')) return '#3b82f6';
  if (t.includes('semi')) return '#f97316';
  return '#06b6d4'; // detached / default
}

function getTypeBadgeStyle(type: string) {
  const color = getTypeColor(type);
  return { background: `${color}15`, color, border: `1px solid ${color}30`, padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 700 as const, whiteSpace: 'nowrap' as const };
}

export default function MapExplorer() {
  const [city, setCity] = useState<CityConfig>(CITIES[0]);
  const [listings, setListings] = useState<ListingMarker[]>([]);
  const [mapListings, setMapListings] = useState<ListingMarker[]>([]);
  const [count, setCount] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [mobileShowList, setMobileShowList] = useState(false);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Filters>({ minPrice: null, maxPrice: null, beds: 'Any', baths: 'Any', propertyType: 'All', sort: 'recommended' });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalEstimate, setTotalEstimate] = useState(0);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const lastBoundsRef = useRef<{ minLat: number; maxLat: number; minLng: number; maxLng: number } | null>(null);
  const router = useRouter();

  // Load favourites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lb_favourites');
      if (saved) setFavourites(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const toggleFavourite = useCallback((key: string) => {
    setFavourites(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      localStorage.setItem('lb_favourites', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const fetchListings = useCallback(async (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }, page: number, append: boolean) => {
    if (page === 0) setLoading(true); else setLoadingMore(true);
    try {
      const res = await fetch('/api/listings/bounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bounds,
          cityFilter: city.name,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          beds: filters.beds,
          baths: filters.baths,
          propertyType: filters.propertyType,
          sort: filters.sort,
          page,
          pageSize: 50,
        })
      });
      const data = await res.json();
      if (data.results) {
        if (append) {
          setListings(prev => [...prev, ...data.results]);
          // keep mapListings as is
        } else {
          setListings(data.results);
          if (data.mapPoints) {
            setMapListings(data.mapPoints);
          } else {
            setMapListings(data.results);
          }
        }
        // Only update totals from page 0 (subsequent pages don't compute them)
        if (data.totalEstimate && data.totalEstimate > 0) {
          setCount(data.totalEstimate);
          setTotalEstimate(data.totalEstimate);
        }
        if (data.stats?.avgPrice && data.stats.avgPrice > 0) {
          setAvgPrice(data.stats.avgPrice);
        }
        setHasMore(data.hasMore);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [city.name, filters, avgPrice]);

  const handleBoundsChange = useCallback(async (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => {
    lastBoundsRef.current = bounds;
    fetchListings(bounds, 0, false);
  }, [fetchListings]);

  const handleLoadMore = useCallback(() => {
    if (!lastBoundsRef.current || loadingMore || !hasMore) return;
    fetchListings(lastBoundsRef.current, currentPage + 1, true);
  }, [fetchListings, currentPage, loadingMore, hasMore]);

  const handleMarkerClick = useCallback((key: string) => {
    setSelectedKey(key);
    // Scroll sidebar to the card
    const el = cardRefs.current[key];
    if (el && panelRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // If the marker represents a property not currently loaded in the paginated sidebar cards, open it directly
      router.push(`/listing/${key}`);
    }
  }, [router]);

  const activeFilters = [
    filters.minPrice || filters.maxPrice ? PRICE_RANGES.find(p => p.min === filters.minPrice && p.max === filters.maxPrice)?.label || 'Custom Price' : null,
    filters.beds !== 'Any' ? `${filters.beds}+ Beds` : null,
    filters.baths !== 'Any' ? `${filters.baths}+ Baths` : null,
    filters.propertyType !== 'All' ? filters.propertyType : null,
  ].filter(Boolean);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', overflow: 'hidden', background: '#f8f7f5' }}>
      
      {/* ═══════════════ LEFT PANEL ═══════════════ */}
      <div 
        ref={panelRef}
        style={{ 
          width: '420px', minWidth: '420px', height: '100%', display: 'flex', flexDirection: 'column',
          borderRight: '1px solid #e8e5e0', background: 'white', zIndex: 10,
          ...(mobileShowList ? {} : {}),
        }}
        className="map-panel"
      >
        {/* Header */}
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f0ede8' }}>
          {/* City Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto' }}>
            {CITIES.map(c => (
              <button
                key={c.name}
                onClick={() => setCity(c)}
                style={{
                  padding: '6px 14px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  background: city.name === c.name ? '#111' : '#f4f3f0',
                  color: city.name === c.name ? 'white' : '#666',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >{c.name}</button>
            ))}
          </div>
          
          {/* Filter Toggle + Count */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>
                {loading ? '...' : totalEstimate > 0 ? totalEstimate.toLocaleString() : count.toLocaleString()} Listings
              </h2>
              {avgPrice > 0 && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#999' }}>Avg. {formatPrice(avgPrice)}</p>}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8, border: '1.5px solid #e5e5e5', background: showFilters ? '#111' : 'white',
                color: showFilters ? 'white' : '#555', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
              Filters{activeFilters.length > 0 ? ` (${activeFilters.length})` : ''}
            </button>
          </div>

          {/* Active Filter Pills */}
          {activeFilters.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {activeFilters.map(f => (
                <span key={f} style={{ background: '#f0f0f0', padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, color: '#555' }}>{f}</span>
              ))}
              <button
                onClick={() => setFilters({ minPrice: null, maxPrice: null, beds: 'Any', baths: 'Any', propertyType: 'All', sort: 'recommended' })}
                style={{ background: 'none', border: 'none', color: '#da291c', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
              >Clear All</button>
            </div>
          )}
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0ede8', background: '#fafaf8' }}>
            {/* Price */}
            <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Price Range</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {PRICE_RANGES.map(p => (
                <button
                  key={p.label}
                  onClick={() => setFilters(f => ({ ...f, minPrice: p.min, maxPrice: p.max }))}
                  style={{
                    padding: '6px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    border: filters.minPrice === p.min && filters.maxPrice === p.max ? '1.5px solid #111' : '1.5px solid #e5e5e5',
                    background: filters.minPrice === p.min && filters.maxPrice === p.max ? '#111' : 'white',
                    color: filters.minPrice === p.min && filters.maxPrice === p.max ? 'white' : '#555',
                  }}
                >{p.label}</button>
              ))}
            </div>

            {/* Beds & Baths */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bedrooms</p>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['Any', '1', '2', '3', '4'].map(b => (
                    <button key={b} onClick={() => setFilters(f => ({ ...f, beds: b }))}
                      style={{
                        flex: 1, padding: '6px 0', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        border: filters.beds === b ? '1.5px solid #111' : '1.5px solid #e5e5e5',
                        background: filters.beds === b ? '#111' : 'white', color: filters.beds === b ? 'white' : '#555',
                      }}
                    >{b === 'Any' ? '—' : `${b}+`}</button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bathrooms</p>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['Any', '1', '2', '3'].map(b => (
                    <button key={b} onClick={() => setFilters(f => ({ ...f, baths: b }))}
                      style={{
                        flex: 1, padding: '6px 0', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        border: filters.baths === b ? '1.5px solid #111' : '1.5px solid #e5e5e5',
                        background: filters.baths === b ? '#111' : 'white', color: filters.baths === b ? 'white' : '#555',
                      }}
                    >{b === 'Any' ? '—' : `${b}+`}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Property Type */}
            <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Property Type</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PROPERTY_TYPES.map(t => (
                <button key={t} onClick={() => setFilters(f => ({ ...f, propertyType: t }))}
                  style={{
                    padding: '6px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    border: filters.propertyType === t ? `1.5px solid ${getTypeColor(t)}` : '1.5px solid #e5e5e5',
                    background: filters.propertyType === t ? getTypeColor(t) : 'white',
                    color: filters.propertyType === t ? 'white' : '#555',
                  }}
                >{t}</button>
              ))}
            </div>
          </div>
        )}

        {/* Sort Bar */}
        <div style={{ padding: '8px 20px', borderBottom: '1px solid #f0ede8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4, fontSize: 12 }}>
            {[
              { key: 'recommended', label: 'Recommended' },
              { key: 'newest', label: 'Newest' },
              { key: 'price_asc', label: 'Price ↑' },
              { key: 'price_desc', label: 'Price ↓' },
            ].map(s => (
              <button key={s.key} onClick={() => setFilters(f => ({ ...f, sort: s.key }))}
                style={{
                  padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer', fontWeight: 700,
                  background: filters.sort === s.key ? '#f0f0f0' : 'transparent',
                  color: filters.sort === s.key ? '#111' : '#aaa',
                }}
              >{s.label}</button>
            ))}
          </div>
        </div>

        {/* Listing Cards */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {listings.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <p style={{ margin: '16px 0 4px', fontSize: 16, fontWeight: 700, color: '#888' }}>No listings in this area</p>
              <p style={{ margin: 0, fontSize: 13, color: '#aaa' }}>Try panning or zooming out to see more results</p>
            </div>
          )}

          {listings.map(l => (
            <div
              key={l.listing_key}
              ref={el => { cardRefs.current[l.listing_key] = el; }}
              onClick={() => { router.push(`/listing/${l.listing_key}`); }}
              onMouseEnter={() => setSelectedKey(l.listing_key)}
              onMouseLeave={() => setSelectedKey(null)}
              style={{
                marginBottom: 12, borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                border: selectedKey === l.listing_key ? '2px solid #111' : '1.5px solid #eee',
                background: 'white', transition: 'all 0.2s',
                boxShadow: selectedKey === l.listing_key ? '0 4px 20px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
                transform: selectedKey === l.listing_key ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              {/* Photo */}
              <div style={{ position: 'relative', height: 160, background: '#f0ede8' }}>
                {l.photo_urls?.[0] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={l.photo_urls[0]} alt={l.address_street} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                  </div>
                )}
                
                {/* Freshness badge */}
                {l.listing_contract_date && (
                  <span style={{
                    position: 'absolute', bottom: 8, left: 8,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                    color: 'white', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                  }}>{daysAgo(l.listing_contract_date)}</span>
                )}

                {/* Favourite heart */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavourite(l.listing_key); }}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={favourites.has(l.listing_key) ? '#da291c' : 'none'} stroke={favourites.has(l.listing_key) ? '#da291c' : '#666'} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>

                {/* Property type badge */}
                <span style={{
                  position: 'absolute', top: 8, left: 8,
                  ...getTypeBadgeStyle(l.property_type),
                }}>{l.property_type || 'Residential'}</span>
              </div>

              {/* Info */}
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>
                    {l._vow_locked && l.listing_status === 'Sold' 
                      ? <span style={{ filter: 'blur(4px)' }}>$850,000</span>
                      : formatPrice(l.list_price)
                    }
                  </p>
                  {l.listing_status === 'Sold' && !l._vow_locked && (
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase' }}>Sold</span>
                  )}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666', fontWeight: 500 }}>{l.address_street}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#aaa' }}>{l.address_city || city.name}, ON</p>
                <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, color: '#888', fontWeight: 600, flexWrap: 'wrap' }}>
                  <span>{l.bedrooms_total} Bed</span>
                  <span>{l.bathrooms_total} Bath</span>
                  {l.living_area != null && <span>{l.living_area.toLocaleString()} sqft</span>}
                  {l.maintenance_fee != null && l.maintenance_fee > 0 && (
                    <span style={{ color: '#da291c' }}>Maint: ${Math.round(l.maintenance_fee).toLocaleString()}</span>
                  )}
                </div>
                {l.description && (
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: '#999', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {l.description}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              style={{
                width: '100%', padding: '14px 0', marginTop: 8, marginBottom: 12,
                borderRadius: 10, border: '1.5px solid #e5e5e5', background: 'white',
                color: '#111', fontSize: 14, fontWeight: 800, cursor: loadingMore ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = '#f8f7f5'; (e.target as HTMLElement).style.borderColor = '#111'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = 'white'; (e.target as HTMLElement).style.borderColor = '#e5e5e5'; }}
            >
              {loadingMore ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid #e5e5e5', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Loading...
                </>
              ) : (
                <>
                  Load More · {listings.length} of {totalEstimate > 0 ? `~${totalEstimate.toLocaleString()}` : '...'}
                </>
              )}
            </button>
          )}

          {!hasMore && listings.length > 0 && (
            <p style={{ textAlign: 'center', fontSize: 12, color: '#ccc', fontWeight: 600, padding: '12px 0' }}>
              Showing all {listings.length.toLocaleString()} listings
            </p>
          )}
        </div>

        {/* Footer Attribution */}
        <div style={{ padding: '8px 20px', borderTop: '1px solid #f0ede8', fontSize: 10, color: '#bbb', textAlign: 'center' }}>
          Data © CREA DDF® · Brokered by eXp Realty Canada
        </div>
      </div>

      {/* ═══════════════ MAP ═══════════════ */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ExplorerMap
          center={city.center}
          zoom={city.zoom}
          listings={mapListings}
          selectedKey={selectedKey}
          onMarkerClick={handleMarkerClick}
          onBoundsChange={handleBoundsChange}
          filters={filters}
        />

        {/* Floating stats bar at bottom of map */}
        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 12, padding: '10px 20px',
          background: 'rgba(17,17,17,0.85)', backdropFilter: 'blur(12px)', borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          {[
            { label: 'Active', value: count.toLocaleString() },
            { label: 'Avg Price', value: formatPrice(avgPrice) },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', minWidth: 80 }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="map-mobile-toggle"
          onClick={() => setMobileShowList(!mobileShowList)}
          style={{
            display: 'none', /* shown via CSS media query */
            position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            padding: '10px 20px', borderRadius: 100, border: 'none',
            background: '#111', color: 'white', fontWeight: 800, fontSize: 14,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)', cursor: 'pointer', zIndex: 500,
          }}
        >
          {mobileShowList ? '🗺️ Show Map' : '📋 Show Listings'}
        </button>
      </div>

      {/* Global responsive styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .map-panel { 
            position: fixed !important; bottom: 0; left: 0; right: 0; 
            width: 100% !important; min-width: 100% !important;
            height: 50vh !important; z-index: 100 !important;
            border-right: none !important; border-top: 1px solid #e5e5e5 !important;
            border-radius: 16px 16px 0 0; 
            transform: translateY(${mobileShowList ? '0' : 'calc(100% - 60px)'});
            transition: transform 0.3s ease;
          }
          .map-mobile-toggle { display: block !important; }
        }
      `}} />
    </div>
  );
}
