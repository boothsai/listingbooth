'use client';

import { useState, useEffect } from 'react';
import { usePropertyViewTracker } from '@/hooks/usePropertyViewTracker';

interface Props {
  token: string;
  agentName: string;
}

export default function RegistrationWall({ token, agentName }: Props) {
  const { viewState, dismissSoftWall } = usePropertyViewTracker(token);
  const [recoChecked, setRecoChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [checkboxError, setCheckboxError] = useState(false);
  const [phone, setPhone] = useState('');
  // Allow external components (SaveListingButton, DynamicMap) to force the wall open
  const [forcedOpen, setForcedOpen] = useState(false);

  useEffect(() => {
    const handler = () => setForcedOpen(true);
    window.addEventListener('registrationwall:open', handler);
    return () => window.removeEventListener('registrationwall:open', handler);
  }, []);

  const handleGoogleLogin = async () => {
    // Enforce RECO checkboxes on the hard wall
    const isHard = viewState === 'hard' || forcedOpen;
    if (isHard && (!recoChecked || !privacyChecked)) {
      setCheckboxError(true);
      return;
    }
    setCheckboxError(false);
    // Store phone for post-auth lead enrichment
    if (phone.trim()) {
      localStorage.setItem('listingbooth_lead_phone', phone.trim());
    }
    const { createClient } = await import('@/utils/supabase/client');
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/share/${token}&t=${token}`
      }
    });
  };

  const handleDismiss = () => {
    setForcedOpen(false);
    dismissSoftWall();
  };

  // Show wall if forced-open externally, or if the tracker says soft/hard
  const effectiveState = forcedOpen ? 'hard' : viewState;
  if (effectiveState === 'loading' || effectiveState === 'free') return null;

  const isHard = effectiveState === 'hard';

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(16px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.3s ease-out',
      padding: '24px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '48px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        textAlign: 'center',
        position: 'relative'
      }}>
        {effectiveState === 'soft' && (
          <button 
            onClick={handleDismiss}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'none', border: 'none', fontSize: '24px', color: '#999', cursor: 'pointer'
            }}
          >
            ×
          </button>
        )}

        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#da291c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900, margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(218,41,28,0.3)' }}>
          {agentName.charAt(0).toUpperCase()}
        </div>

        <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-1px', color: '#111' }}>
          {isHard ? 'Create your free account' : 'Join my private network'}
        </h2>
        
        <p style={{ fontSize: '15px', color: '#555', lineHeight: 1.6, marginBottom: '32px' }}>
          {isHard
            ? `To comply with local real estate regulations, you must create a free account to view more properties.`
            : `Get instant alerts for new listings, off-market properties, and detailed market insights curated by ${agentName}.`}
        </p>

        {isHard && (
          <div style={{ textAlign: 'left', marginBottom: '16px', fontSize: '13px', color: '#666', background: '#f9f9f9', padding: '16px', borderRadius: '12px', border: `1px solid ${checkboxError ? '#da291c' : '#eee'}` }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={recoChecked}
                onChange={e => { setRecoChecked(e.target.checked); setCheckboxError(false); }}
                style={{ marginTop: '2px', accentColor: '#da291c' }}
              />
              <span>I acknowledge receipt of the <a href="/legal/reco-guide" target="_blank" rel="noopener noreferrer" style={{color: '#da291c'}}>RECO Information Guide</a>.</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={privacyChecked}
                onChange={e => { setPrivacyChecked(e.target.checked); setCheckboxError(false); }}
                style={{ marginTop: '2px', accentColor: '#da291c' }}
              />
              <span>I agree to the Terms of Service and Privacy Policy.</span>
            </label>
            {checkboxError && (
              <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#da291c', fontWeight: 700 }}>
                Please acknowledge both items above to continue.
              </p>
            )}
          </div>
        )}

        {/* Phone Capture — Critical for SMS Speed-to-Lead */}
        {isHard && (
          <div style={{ marginBottom: '16px' }}>
            <input
              type="tel"
              placeholder="Phone number (optional — for instant alerts)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{
                width: '100%', padding: '14px 16px',
                border: '1.5px solid #e5e5e5', borderRadius: '10px',
                fontSize: '15px', fontWeight: 500, outline: 'none',
                transition: 'border-color 0.2s', boxSizing: 'border-box',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#da291c'}
              onBlur={e => e.currentTarget.style.borderColor = '#e5e5e5'}
            />
          </div>
        )}


        <button style={{
          width: '100%',
          padding: '16px',
          background: '#111',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 800,
          cursor: 'pointer',
          marginBottom: effectiveState === 'soft' ? '16px' : '0',
          transition: 'transform 0.2s',
        }}
        onClick={handleGoogleLogin}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          Continue with Google
        </button>

        {effectiveState === 'soft' && (
          <button 
            onClick={handleDismiss}
            style={{
              width: '100%',
              padding: '16px',
              background: 'white',
              color: '#555',
              border: '2px solid #eee',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseOut={(e) => e.currentTarget.style.background = 'white'}
          >
            Let me see one more before I register
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(16px); }
        }
      `}</style>
    </div>
  );
}
