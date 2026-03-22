'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/lib/supabase/browser';
import type { User } from '@supabase/supabase-js';

export default function NavHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [recoChecked, setRecoChecked] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Intercept VOW Auth Gateway redirection
    if (typeof window !== 'undefined' && window.location.search.includes('auth=1')) {
      setShowAuthModal(true);
      // Clean up URL to prevent trigger loop
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    // Get current session
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function signInWithGoogle() {
    const redirectTo = `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '';

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
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '10px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-transparent.png"
            alt="ListingBooth"
            style={{ height: '62px', width: 'auto' }}
          />
          <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '28px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>
            listing<span style={{ color: '#da291c' }}>booth</span>.com
          </span>
        </Link>
      </div>

      {/* Nav links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {['Buy', 'Sell', 'Agents', 'Map Search', 'Market Trends', 'Tools', 'Platform'].map(item => (
          <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
            style={{
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '27px',
              fontWeight: 700,
              color: '#111',
              textDecoration: 'none',
              letterSpacing: '-0.2px',
              lineHeight: 1,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#da291c')}
            onMouseLeave={e => (e.currentTarget.style.color = '#111')}
          >{item}</a>
        ))}
      </nav>

      {/* CTA Row — Google SSO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user ? (
          <>
            {/* User avatar */}
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#da291c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, flexShrink: 0 }}>
              {initials}
            </div>
            <button
              onClick={signOut}
              style={{ fontSize: '15px', fontWeight: 700, color: '#666', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = '#da291c')}
              onMouseLeave={e => (e.currentTarget.style.color = '#666')}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setShowAuthModal(true)} style={{
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '15px', fontWeight: 700,
              color: '#111', background: 'none', border: 'none', cursor: 'pointer', padding: '0',
              transition: 'color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#da291c')}
              onMouseLeave={e => (e.currentTarget.style.color = '#111')}
            >
              Sign In
            </button>
            <button onClick={() => setShowAuthModal(true)} style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#da291c', color: 'white',
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '15px', fontWeight: 800,
              padding: '12px 28px', borderRadius: '8px',
              border: 'none', cursor: 'pointer',
              letterSpacing: '-0.2px',
              boxShadow: '0 4px 18px rgba(218,41,28,0.38)',
              transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#b81e13';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(218,41,28,0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#da291c';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 18px rgba(218,41,28,0.38)';
              }}
            >
              Get Started — Google →
            </button>
          </>
        )}
      </div>

      {/* RECO Compliance Registration Wall (Using Portal to escape header backdrop-filter boundary) */}
      {showAuthModal && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'white', padding: '40px', borderRadius: '16px', width: '90%', maxWidth: '440px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: 800, color: '#111', letterSpacing: '-0.5px' }}>
              Create your ListingBooth
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#555', lineHeight: 1.5 }}>
              To view full MLS® properties, photos, and VOW data, Ontario law requires you to acknowledge the RECO Information Guide.
            </p>

            <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #eee' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={recoChecked} 
                  onChange={(e) => setRecoChecked(e.target.checked)}
                  style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: '#da291c' }}
                />
                <span style={{ fontSize: '13px', color: '#333', lineHeight: 1.5, fontWeight: 500 }}>
                  I acknowledge receiving the <a href="https://www.reco.on.ca/consumers/things-you-need-to-know/reco-information-guide" target="_blank" rel="noopener noreferrer" style={{ color: '#da291c' }}>RECO Information Guide</a> from eXp Realty, Brokerage, and I confirm I am a Self-Represented Party. I also agree to the Privacy Policy.
                </span>
              </label>
            </div>

            <button 
              onClick={signInWithGoogle} 
              disabled={!recoChecked}
              style={{
                width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
                backgroundColor: recoChecked ? '#111' : '#ccc', color: 'white',
                fontSize: '15px', fontWeight: 800, cursor: recoChecked ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s'
              }}
            >
              Continue with Google
            </button>
            <button 
              onClick={() => {
                setShowAuthModal(false);
                // Clean up URL if they cancel
                if (typeof window !== 'undefined' && window.location.search.includes('auth=')) {
                  window.history.replaceState({}, document.title, window.location.pathname);
                }
              }}
              style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: '#888', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}
            >
              Cancel
            </button>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
