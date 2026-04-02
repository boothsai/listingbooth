'use client';

import { useState } from 'react';

interface Props {
  listingKey: string;
  address: string;
  price: string;
  agentName?: string | null;
  brokerage?: string | null;
}

export default function LeadCaptureCard({ listingKey, address, price, agentName, brokerage }: Props) {
  const [activeTab, setActiveTab] = useState<'tour' | 'question'>('tour');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
    preferredDate: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.firstName || !formData.email) return;
    setStatus('loading');

    try {
      // The payload shape commonly expected by Follow Up Boss via clearinghouse
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        message: activeTab === 'tour' 
          ? `[Tour Request: ${formData.preferredDate || 'Flexible'}] ${formData.message}`.trim()
          : formData.message,
        property_id: listingKey,
        source: 'ListingBooth'
      };

      const res = await fetch('/api/leads/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to submit lead');
      
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  if (status === 'success') {
    return (
      <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '24px', padding: '40px 32px', textAlign: 'center', boxShadow: '0 12px 48px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
        <h3 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 900, color: '#111' }}>Request Confirmed!</h3>
        <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#555', lineHeight: 1.6 }}>
          Thanks {formData.firstName}. We have routed your request to the listing team. You'll hear back shortly to confirm the details.
        </p>
        <button 
          onClick={() => { setStatus('idle'); setFormData({...formData, message: ''}); }}
          style={{ padding: '14px 28px', background: 'rgba(0,0,0,0.05)', color: '#111', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.08)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
      {/* Header Info */}
      <div style={{ padding: '32px 32px 20px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <p style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>{price}</p>
        <p style={{ margin: 0, fontSize: '13px', color: '#888', fontWeight: 500 }}>{address}</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <button 
          onClick={() => setActiveTab('tour')}
          style={{ flex: 1, padding: '16px', background: activeTab === 'tour' ? 'rgba(255,255,255,0.5)' : 'transparent', border: 'none', borderBottom: activeTab === 'tour' ? '3px solid #da291c' : '3px solid transparent', color: activeTab === 'tour' ? '#111' : '#888', fontSize: '14px', fontWeight: activeTab === 'tour' ? 800 : 600, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Tour this Home
        </button>
        <button 
          onClick={() => setActiveTab('question')}
          style={{ flex: 1, padding: '16px', background: activeTab === 'question' ? 'rgba(255,255,255,0.5)' : 'transparent', border: 'none', borderBottom: activeTab === 'question' ? '3px solid #111' : '3px solid transparent', color: activeTab === 'question' ? '#111' : '#888', fontSize: '14px', fontWeight: activeTab === 'question' ? 800 : 600, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Ask a Question
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: '24px 32px 32px' }}>
        
        {activeTab === 'tour' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Preferred Date</label>
            <input 
              type="date" 
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '15px', color: '#111', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>First Name *</label>
            <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Jane" style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '15px', color: '#111', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Last Name</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '15px', color: '#111', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Email *</label>
          <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="jane@example.com" style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '15px', color: '#111', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Phone Number</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="(613) 555-0100" style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '15px', color: '#111', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{activeTab === 'tour' ? 'Message (Optional)' : 'Your Question *'}</label>
          <textarea 
            name="message" 
            value={formData.message} 
            onChange={handleInputChange} 
            required={activeTab === 'question'}
            placeholder={activeTab === 'tour' ? "Anything we should know before the tour?" : "I noticed the roof looks older, was it recently replaced?"}
            rows={3}
            style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '15px', color: '#111', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }} 
          />
        </div>

        {status === 'error' && (
          <p style={{ color: '#da291c', fontSize: '13px', marginBottom: '16px', fontWeight: 600 }}>⚠️ Connection failed. Please try again.</p>
        )}

        <button 
          type="submit" 
          disabled={status === 'loading'}
          style={{ width: '100%', padding: '16px', background: activeTab === 'tour' ? 'linear-gradient(135deg, #da291c 0%, #a41b12 100%)' : 'linear-gradient(135deg, #111 0%, #333 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 800, cursor: status === 'loading' ? 'wait' : 'pointer', opacity: status === 'loading' ? 0.8 : 1, transition: 'all 0.2s', letterSpacing: '0.02em', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
        >
          {status === 'loading' ? 'Sending...' : activeTab === 'tour' ? 'Request Tour →' : 'Send Message →'}
        </button>

        {brokerage && (
          <p style={{ margin: '20px 0 0', fontSize: '11px', color: '#aaa', textAlign: 'center', lineHeight: 1.5 }}>
            Listing Provided by <strong style={{ color: '#888' }}>{brokerage}</strong>. <br/> By submitting this form, you agree to be contacted by an agent to fulfill your request.
          </p>
        )}
      </form>
    </div>
  );
}
