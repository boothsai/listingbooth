'use client';

import { useState, useEffect } from 'react';

export default function SaveListingButton({ listingKey }: { listingKey: string }) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/favorites');
        if (res.ok) {
          const data = await res.json();
          if (data.favorites?.includes(listingKey)) {
            setIsSaved(true);
          }
        }
      } catch {}
      setLoading(false);
    }
    checkStatus();
  }, [listingKey]);

  async function toggleSave() {
    setIsSaved(!isSaved); // Optimistic UI
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_key: listingKey })
      });
      if (res.status === 401) {
        setIsSaved(false); // Revert
        // Fire event so RegistrationWall on the same page can intercept it.
        window.dispatchEvent(new CustomEvent('registrationwall:open'));
      }
    } catch {
      setIsSaved(!isSaved); // Revert on network error
    }
  }

  if (loading) return null;

  return (
    <button 
      onClick={toggleSave}
      style={{
        position: 'absolute', top: '20px', right: '20px', width: '48px', height: '48px',
        borderRadius: '50%', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', transition: 'transform 0.2s',
        zIndex: 10
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      aria-label="Save Home"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill={isSaved ? '#da291c' : 'none'} stroke={isSaved ? '#da291c' : '#555'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
  );
}
