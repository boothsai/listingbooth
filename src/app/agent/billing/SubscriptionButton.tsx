'use client';

import { useState } from 'react';

export default function SubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize checkout');

      // Redirect to Stripe
      window.location.href = data.url;
    } catch (err: any) {
      alert(`Checkout error: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCheckout} 
      disabled={loading}
      style={{ 
        padding: '16px', 
        width: '100%', 
        background: '#da291c', 
        color: 'white', 
        border: 'none', 
        borderRadius: '12px', 
        fontWeight: 800, 
        fontSize: '15px', 
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: '0 8px 24px rgba(218, 41, 28, 0.3)',
        opacity: loading ? 0.7 : 1
      }}
    >
      {loading ? 'Processing...' : 'Upgrade Now'}
    </button>
  );
}
