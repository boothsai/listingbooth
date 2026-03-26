'use client';

import { useState } from 'react';

export default function InviteAgentButton() {
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    const email = prompt('Enter the email address of the new agent:');
    if (!email) return;

    // Basic validation
    if (!email.includes('@')) {
      alert('Invalid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to invite agent');
      
      alert(`Invitation sent successfully to ${email}`);
      window.location.reload(); // Refresh roster
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleInvite}
      disabled={loading}
      style={{ 
        padding: '16px 32px', 
        backgroundColor: '#da291c', 
        color: 'white', 
        border: 'none', 
        borderRadius: '12px', 
        fontWeight: 800, 
        fontSize: '15px', 
        cursor: loading ? 'not-allowed' : 'pointer', 
        boxShadow: '0 4px 14px rgba(218,41,28,0.3)',
        opacity: loading ? 0.7 : 1
      }}
    >
      {loading ? 'Sending...' : '✉️ Invite New Agent'}
    </button>
  );
}
