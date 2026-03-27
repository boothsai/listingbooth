'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AgentLoginPortal() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push('/agent');
    });
  }, [router, supabase]);

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.push('/agent');
    }
  }

  async function signInWithGoogle() {
    setLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa', position: 'relative', overflow: 'hidden' }}>
      
      {/* Universal Brand Geometric Flare (Perfect Inheritance from Consumer Home) */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(218,41,28,0.05) 0%, rgba(250,250,250,0) 70%)', filter: 'blur(40px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(17,17,17,0.03) 0%, rgba(250,250,250,0) 70%)', filter: 'blur(40px)', zIndex: 0 }} />

      {/* Back to Consumer Home Navigation */}
      <div style={{ padding: '40px', position: 'relative', zIndex: 10 }}>
        <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '14px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#111'} onMouseLeave={e => e.currentTarget.style.color = '#888'}>
          ← Back to Consumer Portal
        </Link>
      </div>

      {/* Centralized High-Conversion Auth Card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', zIndex: 10 }}>
        <div style={{ background: 'white', padding: '48px', borderRadius: '24px', boxShadow: '0 24px 64px rgba(0,0,0,0.06)', width: '100%', maxWidth: '460px', border: '1px solid rgba(0,0,0,0.04)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-transparent.png" alt="ListingBooth" style={{ height: '48px', width: 'auto' }} />
            </div>
            <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>
              Welcome back.
            </h1>
            <p style={{ margin: 0, fontSize: '15px', color: '#666', lineHeight: 1.5 }}>
              Sign in to access your secure ListingBooth portal.
            </p>
          </div>

          {errorMsg && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '24px', fontWeight: 500, textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={signInWithEmail} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#444', marginBottom: '8px' }}>Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#111'}
                onBlur={e => e.target.style.borderColor = '#ddd'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#444', marginBottom: '8px' }}>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#111'}
                onBlur={e => e.target.style.borderColor = '#ddd'}
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '16px', borderRadius: '12px', border: 'none', marginTop: '8px',
                backgroundColor: '#da291c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                fontSize: '15px', fontWeight: 800, cursor: loading ? 'wait' : 'pointer',
                transition: 'all 0.2s', letterSpacing: '0.02em',
                boxShadow: '0 8px 24px rgba(218,41,28,0.2)'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#b91c1c'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#da291c'; }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', background: '#eaeaea' }} />
            <span style={{ fontSize: '12px', color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#eaeaea' }} />
          </div>

          <button 
            type="button"
            onClick={signInWithGoogle} 
            disabled={loading}
            style={{
              width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #eaeaea',
              backgroundColor: 'white', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              fontSize: '15px', fontWeight: 800, cursor: loading ? 'wait' : 'pointer',
              transition: 'all 0.2s', letterSpacing: '0.02em'
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fafafa'; e.currentTarget.style.borderColor = '#ddd'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#eaeaea'; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f5f5f5', padding: '6px 12px', borderRadius: '100px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              <p style={{ margin: 0, fontSize: '11px', color: '#666', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                API Gateway Encrypted
              </p>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}
