'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import type { User } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';

export default function NavHeader() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const pathname = usePathname();

  const isLoginPage = pathname === '/agent/login';

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  }

  if (isLoginPage) return null;

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '';

  /* ── MODE 1: THE AGENT COMMAND CENTER (Dark Mode) ── */
  if (pathname.startsWith('/agent')) {
    return (
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: '110px',
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Link href="/agent" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '8px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-transparent.png" alt="ListingBooth" style={{ height: '62px', width: 'auto' }} />
            <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '28px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>
              Listing<span style={{ color: '#da291c' }}>Booth</span>.com
            </span>
            <span style={{ marginLeft: '12px', fontSize: '10px', fontWeight: 800, padding: '4px 8px', background: 'rgba(218,41,28,0.1)', color: '#da291c', borderRadius: '4px', letterSpacing: '0.1em' }}>AGENT PORTAL</span>
          </Link>
        </div>

        {/* Agent Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {[
            { label: 'Smart Inbox', href: '/agent' },
            { label: 'AI Intelligence', href: '/agent/intelligence' },
            { label: 'Tours', href: '/agent/tours' },
            { label: 'Billing', href: '/agent/billing' },
            { label: 'Settings', href: '/agent/settings' }
          ].map(item => (
            <Link key={item.label} href={item.href}
              style={{
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: '15px',
                fontWeight: 700,
                color: pathname === item.href ? '#da291c' : '#111',
                textDecoration: 'none',
                letterSpacing: '-0.2px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#da291c')}
              onMouseLeave={e => (e.currentTarget.style.color = pathname === item.href ? '#da291c' : '#111')}
            >{item.label}</Link>
          ))}
          {user?.user_metadata?.role === 'admin' && (
            <Link href="/admin"
              style={{
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: '12px',
                fontWeight: 800,
                color: '#da291c',
                textDecoration: 'none',
                letterSpacing: '0.1em',
                padding: '6px 12px',
                background: 'rgba(218,41,28,0.1)',
                borderRadius: '100px',
                border: '1px solid rgba(218,41,28,0.2)'
              }}
            >OVERSEER</Link>
          )}
        </nav>

        {/* Profile & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 16px 6px 6px', background: '#fafafa', borderRadius: '100px', border: '1px solid #eaeaea' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#da291c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900 }}>
                  {initials}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>{user.email}</span>
              </div>
              
              <button
                onClick={signOut}
                style={{ fontSize: '14px', fontWeight: 700, color: '#666', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onMouseEnter={e => (e.currentTarget.style.color = '#da291c')}
                onMouseLeave={e => (e.currentTarget.style.color = '#666')}
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </header>
    );
  }

  /* ── MODE 2: THE CONSUMER FRONT-END (Light Mode Glassmorphism) ── */
  const NAV_ITEMS = [
    { label: 'Sell', href: '/sell' },
    { label: 'New Homes', href: '/new-construction' },
    { label: 'Map', href: '/map-search' },
    { label: 'Market Trends', href: '/market-report' },
    { label: 'Tools', href: '/tools' },
    { label: 'Platform', href: '/platform' },
  ];

  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 48px', height: '110px',
      backgroundColor: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(0,0,0,0.07)',
      boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
    }}>
      {/* Logo */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '10px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-transparent.png" alt="ListingBooth" style={{ height: '62px', width: 'auto' }} />
          <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '28px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>
            Listing<span style={{ color: '#da291c' }}>Booth</span>.com
          </span>
        </Link>
      </div>

      {/* Desktop Nav links */}
      <nav style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
        {NAV_ITEMS.map(item => (
          <Link key={item.label} href={item.href}
            style={{ 
              fontWeight: 800, fontSize: '18px', textDecoration: 'none', whiteSpace: 'nowrap',
              color: pathname === item.href ? '#da291c' : '#111',
              transition: 'all 0.2s', letterSpacing: '-0.02em', textTransform: 'uppercase' 
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#da291c'}
            onMouseLeave={e => e.currentTarget.style.color = pathname === item.href ? '#da291c' : '#111'}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Desktop CTA Row */}
      <div className="desktop-cta" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
        {user ? (
          <>
            <Link href="/favorites" style={{ fontSize: '14px', fontWeight: 800, color: '#111', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.7, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
            >
              ♥ Saved
            </Link>
            <Link href="/dashboard" style={{ fontSize: '14px', fontWeight: 800, color: '#111', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.7, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
            >
              📊 Dashboard
            </Link>
            <Link href="/agent" style={{ fontSize: '14px', fontWeight: 800, color: '#da291c', textDecoration: 'none', background: 'rgba(218,41,28,0.1)', padding: '10px 20px', borderRadius: '100px', transition: 'all 0.2s', letterSpacing: '0.05em' }}>
              CRM DASHBOARD
            </Link>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#da291c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, flexShrink: 0 }}>
              {initials}
            </div>
          </>
        ) : (
          <Link href="/agent/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#111', color: 'white',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '14px', fontWeight: 800,
            padding: '12px 24px', borderRadius: '8px',
            textDecoration: 'none',
            letterSpacing: '0.02em',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#da291c';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(218,41,28,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#111';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Login
          </Link>
        )}
      </div>

      {/* Hamburger Button (shown on mobile via CSS) */}
      <button 
        className={`hamburger-btn${mobileOpen ? ' open' : ''}`}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation menu"
      >
        <span /><span /><span />
      </button>
    </header>

    {/* Mobile Nav Overlay */}
    <div className={`mobile-nav-overlay${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)} />

    {/* Mobile Nav Drawer */}
    <div className={`mobile-nav-drawer${mobileOpen ? ' open' : ''}`}>
      {NAV_ITEMS.map(item => (
        <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)}
          style={{ color: pathname === item.href ? '#da291c' : undefined }}
        >
          {item.label}
        </Link>
      ))}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', marginTop: '16px', paddingTop: '16px' }}>
        {user ? (
          <>
            <Link href="/favorites" onClick={() => setMobileOpen(false)}>♥ Saved Homes</Link>
            <Link href="/dashboard" onClick={() => setMobileOpen(false)}>📊 Dashboard</Link>
            <Link href="/agent" onClick={() => setMobileOpen(false)} style={{ color: '#da291c' }}>CRM Dashboard</Link>
          </>
        ) : (
          <Link href="/agent/login" onClick={() => setMobileOpen(false)} style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', padding: '16px', marginTop: '8px',
            background: '#da291c', color: 'white', borderRadius: '12px',
            fontWeight: 800, fontSize: '16px', letterSpacing: '0.02em'
          }}>
            Login
          </Link>
        )}
      </div>
    </div>
    </>
  );
}
