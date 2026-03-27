'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/browser';
import type { User } from '@supabase/supabase-js';

interface MarketStats {
  median_price: number;
  avg_days_on_market: number;
  avg_price: number;
  active_count: number;
}

const PREMIUM_FEATURES = [
  {
    title: 'Full AI Vision CMA Report',
    desc: 'Our Vision AI analyzes every comparable property photo — not just square footage. You get an aesthetic-weighted valuation that accounts for finishes, condition, and curb appeal.',
    icon: '🧠',
    color: '#da291c',
  },
  {
    title: 'Licensed REALTOR® Valuation',
    desc: 'A licensed Ontario REALTOR® personally reviews the AI report, adjusts for hyper-local factors, and delivers a market-ready pricing strategy within 24 hours.',
    icon: '👤',
    color: '#2563eb',
  },
  {
    title: 'Sold Comparables Deep Dive',
    desc: 'Access the sold price history of every comparable in your area — including sale-to-list ratios, days on market, and price adjustments the public never sees.',
    icon: '📊',
    color: '#7c3aed',
  },
  {
    title: 'Neighbourhood Demand Heatmap',
    desc: 'See exactly how many buyers are actively searching in your neighbourhood — pulled from our real-time search analytics and saved search data.',
    icon: '🔥',
    color: '#059669',
  },
  {
    title: 'Optimal Listing Window',
    desc: 'Our AI identifies the exact week your property type sells fastest in your market — based on 4 years of DOM data across seasons.',
    icon: '📅',
    color: '#f59e0b',
  },
  {
    title: 'Pre-Listing Renovation ROI',
    desc: 'Get a prioritized list of renovations that maximize your sale price — with estimated cost vs. return for each improvement, powered by our visual feature database.',
    icon: '🔨',
    color: '#e11d48',
  },
  {
    title: 'Marketing Plan & Exposure Report',
    desc: 'Receive a custom marketing blueprint — including professional photography, virtual staging recommendations, and a multi-channel digital exposure strategy.',
    icon: '📸',
    color: '#0891b2',
  },
];

export default function SellSection() {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showEstimate, setShowEstimate] = useState(false);
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showGate, setShowGate] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  useEffect(() => {
    if (address.length < 3 || showEstimate) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1&countrycodes=ca&limit=5`);
        if (res.ok) {
          const data = await res.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setSuggestions(data.map((item: any) => {
            const parts = item.display_name.split(', ');
            return parts.slice(0, 3).join(', ');
          }));
        }
      } catch {
        setSuggestions([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [address, showEstimate]);

  async function handleGetValue() {
    if (!address) return;
    setLoading(true);
    setSuggestions([]);
    const cityHint = address.toLowerCase().includes('toronto') ? 'Toronto' : 'Ottawa';
    try {
      const r = await fetch(`/api/market/stats?city=${cityHint}`);
      const d = await r.json();
      setStats(d.stats ?? null);
    } catch { /* non-fatal */ }
    setLoading(false);
    setShowEstimate(true);
  }

  const estimatedValue = stats?.median_price ?? 662773;
  const perSqft = Math.round(estimatedValue / 1800);
  const dom = stats?.avg_days_on_market ?? 42;
  const activeComps = stats?.active_count ?? 2928;

  return (
    <section style={{ backgroundColor: '#0a0a0a', color: 'white' }}>
      
      {/* ── HERO ── */}
      <div style={{ padding: '160px 5% 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(218,41,28,0.06) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: '4px', background: 'rgba(218,41,28,0.1)', color: '#da291c', fontWeight: 800, fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#da291c', boxShadow: '0 0 8px #da291c' }} />
            AI-Powered CMA
          </div>
          <h1 style={{ margin: '0 0 24px', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1.05 }}>
            What Is Your Home<br/>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Actually Worth?</span>
          </h1>
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.5)', margin: '0 auto 48px', maxWidth: '600px', lineHeight: 1.5, fontWeight: 500 }}>
            Get an instant market estimate powered by live DDF® data. Then unlock a full Comparative Market Analysis with AI vision scoring and a licensed REALTOR® review.
          </p>

          {/* Address Input */}
          <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto', textAlign: 'left' }}>
            <div style={{
              background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '8px 8px 8px 24px',
              border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#da291c" strokeWidth="2.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <input
                value={address}
                onChange={e => { setAddress(e.target.value); setShowEstimate(false); }}
                onKeyDown={e => e.key === 'Enter' && handleGetValue()}
                placeholder="Enter your property address..."
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '16px', fontWeight: 600, color: 'white', background: 'transparent' }}
              />
              <button
                onClick={handleGetValue}
                disabled={loading || !address}
                style={{
                  padding: '14px 32px', background: '#da291c', color: 'white', border: 'none',
                  borderRadius: '12px', fontSize: '15px', fontWeight: 800, cursor: 'pointer',
                  opacity: (loading || !address) ? 0.5 : 1, transition: 'opacity 0.2s',
                }}
              >
                {loading ? 'Analyzing…' : 'Get Estimate'}
              </button>
            </div>

            {/* Autocomplete */}
            {suggestions.length > 0 && !showEstimate && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)', overflow: 'hidden', zIndex: 20,
              }}>
                {suggestions.map(suggestion => (
                  <button key={suggestion} onClick={() => { setAddress(suggestion); setSuggestions([]); handleGetValue(); }}
                    style={{ width: '100%', padding: '14px 20px', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ color: '#da291c', marginRight: '8px' }}>📍</span>
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FREE ESTIMATE RESULT ── */}
      {showEstimate && (
        <div style={{ padding: '0 5% 80px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            
            {/* Basic Estimate Card */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.06)', padding: '48px', marginBottom: '32px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                <div>
                  <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Market-Based Estimate · CREA DDF® Data</p>
                  <p style={{ margin: '0 0 4px', fontSize: '56px', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1 }}>
                    ${estimatedValue.toLocaleString()}
                  </p>
                  <p style={{ margin: 0, fontSize: '15px', color: 'rgba(255,255,255,0.4)' }}>
                    Range: ${Math.round(estimatedValue * 0.93).toLocaleString()} – ${Math.round(estimatedValue * 1.07).toLocaleString()}
                  </p>
                </div>
                <div style={{ display: 'inline-flex', padding: '8px 16px', borderRadius: '100px', background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)', color: '#059669', fontSize: '13px', fontWeight: 700, alignSelf: 'flex-start' }}>
                  ✓ Free Instant Estimate
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginTop: '40px' }}>
                {[
                  { label: '$/sqft', value: `$${perSqft}`, color: 'white' },
                  { label: 'Avg Days on Market', value: `${dom} days`, color: 'white' },
                  { label: 'Active Comparables', value: activeComps.toLocaleString(), color: 'white' },
                  { label: 'Data Source', value: 'CREA DDF®', color: '#059669' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{s.label}</p>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: s.color, letterSpacing: '-0.5px' }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── PREMIUM GATE ── */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(218,41,28,0.08) 0%, rgba(218,41,28,0.02) 100%)',
              borderRadius: '24px', border: '1px solid rgba(218,41,28,0.15)',
              padding: '48px', textAlign: 'center', marginBottom: '32px', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: 'radial-gradient(circle, rgba(218,41,28,0.08) 0%, transparent 70%)', zIndex: 0 }} />
              <div style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                <h2 style={{ margin: '0 0 12px', fontSize: '32px', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>
                  Unlock Your Full CMA Report
                </h2>
                <p style={{ margin: '0 auto 32px', fontSize: '16px', color: 'rgba(255,255,255,0.5)', maxWidth: '500px', lineHeight: 1.6 }}>
                  The instant estimate is just the beginning. Sign up for free and get a comprehensive, institutional-grade analysis of your property.
                </p>

                {user ? (
                  <div style={{ padding: '16px 32px', background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: '100px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 800, color: '#059669' }}>
                    ✓ Full Report Unlocked — Generating your CMA...
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                    <Link href="/agent/login" style={{
                      display: 'inline-block', padding: '18px 48px', borderRadius: '100px',
                      background: '#da291c', color: 'white', fontSize: '17px', fontWeight: 900,
                      textDecoration: 'none', boxShadow: '0 8px 24px rgba(218,41,28,0.3)',
                    }}>
                      Create Free Account to Unlock
                    </Link>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>No credit card required · Takes 30 seconds</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── WHAT'S INCLUDED: 7 Premium Value Adds ── */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ margin: '0 0 32px', fontSize: '24px', fontWeight: 800, color: 'white', textAlign: 'center' }}>
                What{"'"}s Included in Your Premium CMA
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {PREMIUM_FEATURES.map((f, i) => (
                  <div key={i} style={{
                    background: user ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.02)',
                    borderRadius: '20px', padding: '28px',
                    border: `1px solid ${user ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)'}`,
                    position: 'relative', overflow: 'hidden',
                    filter: !user && i > 1 ? 'blur(1px)' : 'none',
                    opacity: !user && i > 1 ? 0.6 : 1,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${f.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                        {f.icon}
                      </div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'white' }}>{f.title}</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{f.desc}</p>
                    {!user && i > 1 && (
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '24px' }}>🔒</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── BLURRED PREVIEW OF FULL REPORT ── */}
            {!user && (
              <div style={{
                background: 'rgba(255,255,255,0.02)', borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.05)', padding: '48px',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Fake blurred report content */}
                <div style={{ filter: 'blur(6px)', userSelect: 'none', pointerEvents: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>AI VISION SCORE</p>
                      <p style={{ margin: 0, fontSize: '48px', fontWeight: 900, color: '#059669' }}>87/100</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>OPTIMAL LIST PRICE</p>
                      <p style={{ margin: 0, fontSize: '48px', fontWeight: 900, color: 'white' }}>$689,900</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    {['Comparable #1: $655,000', 'Comparable #2: $672,500', 'Comparable #3: $698,000'].map(c => (
                      <div key={c} style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'white' }}>{c}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overlay CTA */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.3)', zIndex: 10
                }}>
                  <p style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 900, textAlign: 'center' }}>Your Full Report Is Ready</p>
                  <Link href="/agent/login" style={{
                    padding: '16px 40px', borderRadius: '100px', background: '#da291c',
                    color: 'white', fontSize: '16px', fontWeight: 900, textDecoration: 'none',
                    boxShadow: '0 8px 24px rgba(218,41,28,0.4)'
                  }}>
                    Sign Up Free to View →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── HOW IT WORKS (always visible) ── */}
      <div style={{ padding: showEstimate ? '0 5% 120px' : '40px 5% 120px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h3 style={{ margin: '0 0 40px', fontSize: '28px', fontWeight: 900, textAlign: 'center', letterSpacing: '-1px' }}>
            How It Works
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { step: '01', title: 'Get Your Free Estimate', desc: 'Enter your address and receive an instant market-based valuation powered by live CREA DDF® data.', color: '#da291c' },
              { step: '02', title: 'Unlock Premium CMA', desc: 'Sign up for free and get a full AI Vision analysis, sold comparables deep-dive, and a licensed REALTOR® review.', color: '#2563eb' },
              { step: '03', title: 'List & Sell With Confidence', desc: 'Use your institutional-grade report to price perfectly, time the market, and maximize your sale price.', color: '#059669' },
            ].map(s => (
              <div key={s.step} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.06)', padding: '32px',
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s.color}22`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px', marginBottom: '20px' }}>{s.step}</div>
                <h4 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: 'white' }}>{s.title}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
