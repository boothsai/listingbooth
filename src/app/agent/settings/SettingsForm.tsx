'use client';

import { useState } from 'react';

export default function SettingsForm({ initialPhone }: { initialPhone: string }) {
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/agent/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert_phone: phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        Mobile Number
      </label>
      <input 
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+1 (555) 000-0000"
        style={{
          width: '100%',
          padding: '16px',
          background: '#0f1115',
          border: '1px solid #2a2d36',
          borderRadius: '12px',
          color: 'white',
          fontSize: '16px',
          marginBottom: '24px',
          outline: 'none'
        }}
        required
      />

      <button 
        type="submit" 
        disabled={loading}
        style={{
          padding: '16px 32px',
          background: 'white',
          color: '#111',
          border: 'none',
          borderRadius: '12px',
          fontWeight: 800,
          fontSize: '15px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {loading ? 'Saving...' : success ? '✅ Saved!' : 'Save Phone Number'}
      </button>
    </form>
  );
}
