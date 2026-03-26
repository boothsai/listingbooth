'use client';

import { useEffect, useState } from 'react';

export function usePropertyViewTracker(token: string) {
  const [viewState, setViewState] = useState<'loading' | 'free' | 'soft' | 'hard'>('loading');

  useEffect(() => {
    // 1. Get viewed properties
    const stored = localStorage.getItem('listingbooth_viewed_properties');
    let viewed = stored ? JSON.parse(stored) : [];

    // 2. Add current token if new
    if (!viewed.includes(token)) {
      viewed.push(token);
      localStorage.setItem('listingbooth_viewed_properties', JSON.stringify(viewed));
    }

    // 3. Determine state
    // View 1 (length 1) = free
    // View 2 (length 2) = soft
    // View 3+ (length 3+) = hard
    if (viewed.length <= 1) {
      setViewState('free');
    } else if (viewed.length === 2) {
      // Check if they dismissed the soft wall
      const dismissed = sessionStorage.getItem('listingbooth_soft_dismissed');
      if (dismissed) {
        setViewState('free');
      } else {
        setViewState('soft');
      }
    } else {
      setViewState('hard');
    }
  }, [token]);

  const dismissSoftWall = () => {
    sessionStorage.setItem('listingbooth_soft_dismissed', 'true');
    setViewState('free');
  };

  return { viewState, dismissSoftWall };
}
