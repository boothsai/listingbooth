'use client';

import { useState, useCallback, useEffect } from 'react';

interface Props {
  photos: string[];
  altText?: string;
}

/**
 * PhotoLightbox — Full-screen gallery viewer for listing photos.
 * 
 * Renders a thumbnail strip. Clicking any thumbnail opens the lightbox overlay
 * with left/right navigation, keyboard support (← → Escape), and a counter.
 */
export default function PhotoLightbox({ photos, altText = 'Property photo' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const open = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const prev = useCallback(() => {
    setActiveIndex(i => (i === 0 ? photos.length - 1 : i - 1));
  }, [photos.length]);

  const next = useCallback(() => {
    setActiveIndex(i => (i === photos.length - 1 ? 0 : i + 1));
  }, [photos.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, prev, next]);

  if (photos.length <= 1) return null;

  return (
    <>
      {/* Thumbnail strip */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', overflowX: 'auto', paddingBottom: '4px' }}>
        {photos.slice(0, 8).map((p, i) => (
          <button
            key={i}
            onClick={() => open(i)}
            style={{
              width: '140px', height: '90px', borderRadius: '10px', overflow: 'hidden',
              border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p} alt={`${altText} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        ))}
        {photos.length > 8 && (
          <button
            onClick={() => open(8)}
            style={{
              width: '140px', height: '90px', borderRadius: '10px', flexShrink: 0,
              border: 'none', background: '#111', color: 'white', cursor: 'pointer',
              fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            +{photos.length - 8} more
          </button>
        )}
      </div>

      {/* Lightbox overlay */}
      {isOpen && (
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(16px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            animation: 'lightboxFade 0.25s ease-out',
          }}
        >
          {/* Close button */}
          <button
            onClick={close}
            style={{
              position: 'absolute', top: '24px', right: '24px',
              background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
              width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer',
              fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>

          {/* Counter */}
          <div style={{
            position: 'absolute', top: '28px', left: '28px',
            color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 700,
          }}>
            {activeIndex + 1} / {photos.length}
          </div>

          {/* Main image */}
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '80vh', position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[activeIndex]}
              alt={`${altText} ${activeIndex + 1}`}
              style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px' }}
            />
          </div>

          {/* Prev/Next buttons */}
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            style={{
              position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
              width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer',
              fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            ‹
          </button>
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            style={{
              position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
              width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer',
              fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            ›
          </button>

          {/* Thumbnail strip at bottom */}
          <div style={{
            position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '8px', overflow: 'auto', maxWidth: '90vw', padding: '4px',
          }}>
            {photos.map((p, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setActiveIndex(i); }}
                style={{
                  width: '60px', height: '40px', borderRadius: '6px', overflow: 'hidden',
                  border: i === activeIndex ? '2px solid #da291c' : '2px solid transparent',
                  padding: 0, cursor: 'pointer', flexShrink: 0, opacity: i === activeIndex ? 1 : 0.5,
                  transition: 'opacity 0.2s',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>

          <style>{`
            @keyframes lightboxFade {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
