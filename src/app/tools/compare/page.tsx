'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/browser';
import type { User } from '@supabase/supabase-js';

interface Listing {
  listing_key: string;
  mls_number: string | null;
  list_price: number;
  property_type: string | null;
  address_street: string | null;
  address_city: string | null;
  address_province: string | null;
  bedrooms_total: number | null;
  bathrooms_total: number | null;
  living_area: number | null;
  lot_size_area: number | null;
  days_on_market: number | null;
  photo_urls: string[] | null;
  listing_brokerage: string | null;
  ai_score: number | null;
  features: string[] | null;
  public_remarks: string | null;
}

const FREE_COMPARISONS = 1;
const STORAGE_KEY = 'lb_comparisons_used';

function getComparisonsUsed(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
}

function incrementComparisons() {
  if (typeof window === 'undefined') return;
  const current = getComparisonsUsed();
  localStorage.setItem(STORAGE_KEY, String(current + 1));
}

export default function PropertyComparePage() {
  const [user, setUser] = useState<User | null>(null);
  const [slots, setSlots] = useState<(Listing | null)[]>([null, null, null]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Listing[]>([]);
  const [searching, setSearching] = useState(false);
  const [comparisonsUsed, setComparisonsUsed] = useState(0);
  const [showGate, setShowGate] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    setComparisonsUsed(getComparisonsUsed());
  }, [supabase]);

  const filledSlots = slots.filter(Boolean).length;
  const isLocked = !user && comparisonsUsed >= FREE_COMPARISONS && filledSlots >= 2;

  const searchListings = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/listings?q=${encodeURIComponent(q)}&limit=8`);
      const data = await res.json();
      setSearchResults(data.listings ?? []);
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => { if (searchQuery) searchListings(searchQuery); }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, searchListings]);

  function selectListing(listing: Listing) {
    if (activeSlot === null) return;
    
    // Check freemium gate
    if (!user && comparisonsUsed >= FREE_COMPARISONS && filledSlots >= 2) {
      setShowGate(true);
      setActiveSlot(null);
      setSearchQuery('');
      setSearchResults([]);
      return;
    }

    const newSlots = [...slots];
    newSlots[activeSlot] = listing;
    setSlots(newSlots);
    setActiveSlot(null);
    setSearchQuery('');
    setSearchResults([]);

    // Track usage
    const newFilled = newSlots.filter(Boolean).length;
    if (newFilled >= 2 && !user) {
      incrementComparisons();
      setComparisonsUsed(getComparisonsUsed() + 1);
    }
  }

  function removeSlot(idx: number) {
    const newSlots = [...slots];
    newSlots[idx] = null;
    setSlots(newSlots);
  }

  const compareRows: { label: string; render: (l: Listing) => string }[] = [
    { label: 'List Price', render: l => `$${l.list_price?.toLocaleString() ?? '—'}` },
    { label: 'Property Type', render: l => l.property_type ?? '—' },
    { label: 'Bedrooms', render: l => l.bedrooms_total?.toString() ?? '—' },
    { label: 'Bathrooms', render: l => l.bathrooms_total?.toString() ?? '—' },
    { label: 'Living Area', render: l => l.living_area ? `${l.living_area.toLocaleString()} sqft` : '—' },
    { label: 'Lot Size', render: l => l.lot_size_area ? `${l.lot_size_area.toLocaleString()} sqft` : '—' },
    { label: 'Days on Market', render: l => l.days_on_market?.toString() ?? '—' },
    { label: 'Price per sqft', render: l => l.living_area && l.list_price ? `$${Math.round(l.list_price / l.living_area).toLocaleString()}` : '—' },
    { label: 'AI Vision Score', render: l => l.ai_score ? `${l.ai_score}/100` : '—' },
    { label: 'Brokerage', render: l => l.listing_brokerage ?? '—' },
    { label: 'Location', render: l => `${l.address_city ?? ''}${l.address_province ? `, ${l.address_province}` : ''}` },
  ];

  return (
    <main style={{ minHeight: '100vh', paddingTop: '110px', backgroundColor: '#0a0a0a', color: 'white' }}>
      
      {/* Hero */}
      <section style={{ padding: '80px 5% 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: '4px', background: 'rgba(37,99,235,0.1)', color: '#3b82f6', fontWeight: 800, fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }} />
            Live MLS® Data
          </div>
          <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1.05 }}>
            Property Comparison<br/>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Engine.</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', margin: 0, maxWidth: '600px', lineHeight: 1.5 }}>
            Pull any listing from the MLS® and compare them side-by-side. Price, size, AI score, price-per-sqft — every data point, instantly.
          </p>
        </div>
      </section>

      {/* Comparison Area */}
      <section style={{ padding: '40px 5% 120px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Slot Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${slots.length}, 1fr)`, gap: '24px', marginBottom: '48px' }}>
            {slots.map((slot, idx) => (
              <div key={idx} style={{
                background: slot ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.02)',
                borderRadius: '24px',
                border: activeSlot === idx ? '2px solid #3b82f6' : slot ? '1px solid rgba(255,255,255,0.06)' : '2px dashed rgba(255,255,255,0.1)',
                overflow: 'hidden', transition: 'all 0.2s',
                minHeight: '320px', display: 'flex', flexDirection: 'column',
              }}>
                {slot ? (
                  <>
                    {/* Photo */}
                    <div style={{
                      height: '160px',
                      background: slot.photo_urls?.[0]
                        ? `url(${slot.photo_urls[0]}) center/cover`
                        : 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)',
                      position: 'relative',
                    }}>
                      <button onClick={() => removeSlot(idx)} style={{
                        position: 'absolute', top: '12px', right: '12px',
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'rgba(0,0,0,0.6)', border: 'none',
                        color: 'white', fontSize: '16px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(4px)'
                      }}>✕</button>
                      {slot.ai_score && (
                        <div style={{ position: 'absolute', bottom: '12px', left: '12px', padding: '4px 10px', background: 'rgba(0,0,0,0.7)', borderRadius: '8px', fontSize: '12px', fontWeight: 800, color: '#3b82f6', backdropFilter: 'blur(4px)' }}>
                          AI: {slot.ai_score}/100
                        </div>
                      )}
                    </div>
                    {/* Details */}
                    <div style={{ padding: '20px', flex: 1 }}>
                      <p style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
                        ${slot.list_price?.toLocaleString()}
                      </p>
                      <p style={{ margin: '0 0 12px', fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                        {slot.address_street}, {slot.address_city}
                      </p>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {slot.bedrooms_total != null && <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>🛏 {slot.bedrooms_total} bed</span>}
                        {slot.bathrooms_total != null && <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>🚿 {slot.bathrooms_total} bath</span>}
                        {slot.living_area != null && <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>📐 {slot.living_area.toLocaleString()} sqft</span>}
                      </div>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => { if (isLocked) { setShowGate(true); } else { setActiveSlot(idx); } }}
                    style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', gap: '12px', padding: '40px'
                    }}
                  >
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>+</div>
                    <span style={{ fontSize: '15px', fontWeight: 700 }}>
                      {isLocked ? '🔒 Login to Compare More' : 'Add Property'}
                    </span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>Search the MLS® to add</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Search Overlay */}
          {activeSlot !== null && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
              zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              paddingTop: '15vh'
            }}>
              <div style={{ width: '100%', maxWidth: '640px', background: '#111', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}>
                {/* Search Input */}
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search by address, city, or MLS# ..."
                      style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: '18px', fontWeight: 600 }}
                    />
                    <button onClick={() => { setActiveSlot(null); setSearchQuery(''); setSearchResults([]); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '8px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                      ESC
                    </button>
                  </div>
                </div>

                {/* Results */}
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {searching && (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
                      Searching MLS® ...
                    </div>
                  )}
                  {!searching && searchResults.length === 0 && searchQuery.length > 0 && (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
                      No listings found. Try a different address or city.
                    </div>
                  )}
                  {searchResults.map(listing => (
                    <button key={listing.listing_key} onClick={() => selectListing(listing)} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '16px 24px', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.03)',
                      cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s', color: 'white',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <div style={{
                        width: '64px', height: '48px', borderRadius: '8px', flexShrink: 0,
                        background: listing.photo_urls?.[0]
                          ? `url(${listing.photo_urls[0]}) center/cover`
                          : 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)',
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {listing.address_street}, {listing.address_city}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                          {listing.bedrooms_total ?? '—'} bed · {listing.bathrooms_total ?? '—'} bath · {listing.property_type ?? 'Residential'}
                        </p>
                      </div>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px', flexShrink: 0 }}>
                        ${listing.list_price?.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Login Gate Modal */}
          {showGate && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
              zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ maxWidth: '480px', width: '90%', background: '#111', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', padding: '48px', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(218,41,28,0.1)', color: '#da291c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '28px' }}>
                  🔒
                </div>
                <h2 style={{ margin: '0 0 12px', fontSize: '28px', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>
                  Your Free Comparison Is Up
                </h2>
                <p style={{ margin: '0 0 32px', fontSize: '16px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                  You{"'"}ve used your free property comparison. Create a free account to unlock unlimited comparisons and save your boards.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link href="/agent/login" style={{
                    display: 'block', padding: '16px', borderRadius: '100px',
                    background: '#da291c', color: 'white', fontSize: '16px', fontWeight: 900,
                    textDecoration: 'none', textAlign: 'center'
                  }}>
                    Create Free Account
                  </Link>
                  <button onClick={() => setShowGate(false)} style={{
                    padding: '16px', borderRadius: '100px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 700, cursor: 'pointer'
                  }}>
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Comparison Table */}
          {filledSlots >= 2 && (
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
            }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'white' }}>Side-by-Side Comparison</h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {compareRows.map((row, ri) => {
                    const values = slots.filter(Boolean).map(s => row.render(s!));
                    // Highlight best value for price (lowest) and area (highest)
                    const numVals = values.map(v => parseFloat(v.replace(/[^0-9.-]/g, '')));
                    const isPrice = row.label.includes('Price') && !row.label.includes('per');
                    const isHigherBetter = row.label.includes('Area') || row.label.includes('Score') || row.label.includes('Lot');
                    
                    let bestIdx = -1;
                    if (numVals.every(n => !isNaN(n)) && numVals.length >= 2) {
                      if (isPrice) bestIdx = numVals.indexOf(Math.min(...numVals));
                      else if (isHigherBetter) bestIdx = numVals.indexOf(Math.max(...numVals));
                    }

                    return (
                      <tr key={row.label} style={{ borderBottom: ri < compareRows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <td style={{ padding: '16px 32px', fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', width: '200px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {row.label}
                        </td>
                        {slots.map((slot, si) => slot ? (
                          <td key={si} style={{
                            padding: '16px 32px', fontSize: '16px', fontWeight: 800,
                            color: si === bestIdx ? '#059669' : 'white',
                            borderLeft: '1px solid rgba(255,255,255,0.04)',
                          }}>
                            {row.render(slot)}
                            {si === bestIdx && <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: 700, color: '#059669', background: 'rgba(5,150,105,0.1)', padding: '2px 6px', borderRadius: '4px' }}>BEST</span>}
                          </td>
                        ) : (
                          <td key={si} style={{ padding: '16px 32px', borderLeft: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.1)' }}>—</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty state */}
          {filledSlots < 2 && (
            <div style={{
              background: 'rgba(255,255,255,0.02)', borderRadius: '24px',
              border: '1px dashed rgba(255,255,255,0.08)', padding: '80px 40px', textAlign: 'center'
            }}>
              <p style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: 'rgba(255,255,255,0.4)' }}>
                Add at least 2 properties to start comparing
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.25)' }}>
                Click the + cards above to search the MLS® and add listings
              </p>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
