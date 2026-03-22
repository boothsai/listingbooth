'use client';

import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  listingKey?: string;
  address?: string;
  price?: string;
  type?: 'showing' | 'info' | 'ai';
}

export default function RequestShowingModal({ isOpen, onClose, listingKey, address, price, type = 'showing' }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) return;
    setStatus('loading');
    try {
      const endpoint = type === 'ai' ? '/api/voice-bridge/call' : '/api/leads';
      const payload = type === 'ai' 
        ? { phone, listing_key: listingKey, address }
        : {
            name, email, phone, message, preferred_date: preferredDate,
            listing_key: listingKey, address, price,
            lead_type: type === 'showing' ? 'Book Showing' : 'Request Info',
          };
          
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  const title = type === 'showing' ? '📅 Book a Showing' : type === 'ai' ? '🤖 Talk to AI Concierge' : '💬 Request Information';
  const subtitle = type === 'ai' ? `Enter your phone number and VABOT will call you instantly about ${address}.` : address ? `Re: ${address}${price ? ` · ${price}` : ''}` : 'eXp Realty Canada';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)', zIndex: 9998,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '100%', maxWidth: '480px', background: 'white', borderRadius: '20px',
        padding: '36px', zIndex: 9999, boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.25s cubic-bezier(0.16,1,0.3,1)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#999', lineHeight: 1 }}>×</button>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 900, color: '#111' }}>
              {type === 'ai' ? 'Connecting Call...' : 'Request Received!'}
            </h3>
            <p style={{ color: '#666', fontSize: '15px', margin: '0 0 24px', lineHeight: 1.6 }}>
              {type === 'ai' 
                ? 'Your phone will ring in 5 seconds. The ListingBooth Concierge is ready.'
                : `An eXp Realty agent will reach out within 24 hours to confirm your ${type === 'showing' ? 'showing' : 'request'}.`}
            </p>
            <button onClick={onClose} style={{ background: '#da291c', color: 'white', border: 'none', borderRadius: '10px', padding: '14px 32px', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>{title}</p>
            <p style={{ margin: '0 0 28px', fontSize: '13px', color: '#888', fontWeight: 500 }}>{subtitle}</p>

            {/* Fields */}
            {type === 'ai' ? (
               <div style={{ marginBottom: '16px' }}>
                 <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Phone Number (Mobile)</label>
                 <input
                   type="tel"
                   value={phone}
                   onChange={e => setPhone(e.target.value)}
                   required
                   placeholder="(613) 555-0100"
                   style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '15px', color: '#111', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                   onFocus={e => (e.target.style.borderColor = '#111')}
                   onBlur={e => (e.target.style.borderColor = '#e5e5e5')}
                 />
               </div>
            ) : (
              [
                { label: 'Full Name *', value: name, set: setName, type: 'text', placeholder: 'Jane Smith', required: true },
                { label: 'Email Address *', value: email, set: setEmail, type: 'email', placeholder: 'jane@example.com', required: true },
                { label: 'Phone Number', value: phone, set: setPhone, type: 'tel', placeholder: '(613) 555-0100', required: false },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{f.label}</label>
                  <input
                    type={f.type}
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    required={f.required}
                    placeholder={f.placeholder}
                    style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '15px', color: '#111', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    onFocus={e => (e.target.style.borderColor = '#da291c')}
                    onBlur={e => (e.target.style.borderColor = '#e5e5e5')}
                  />
                </div>
              ))
            )}

            {type === 'showing' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Preferred Date</label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={e => setPreferredDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '15px', color: '#111', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => (e.target.style.borderColor = '#da291c')}
                  onBlur={e => (e.target.style.borderColor = '#e5e5e5')}
                />
              </div>
            )}

            {type !== 'ai' && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                  placeholder={type === 'showing' ? 'Anything I should know before the showing?' : 'What would you like to know about this property?'}
                  style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '15px', color: '#111', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => (e.target.style.borderColor = '#da291c')}
                  onBlur={e => (e.target.style.borderColor = '#e5e5e5')}
                />
              </div>
            )}

            {status === 'error' && (
              <p style={{ color: '#da291c', fontSize: '13px', marginBottom: '16px', fontWeight: 600 }}>⚠️ Something went wrong. Please try again.</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{ width: '100%', padding: '16px', background: type === 'ai' ? '#111' : '#da291c', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', opacity: status === 'loading' ? 0.7 : 1, letterSpacing: '0.02em' }}
            >
              {status === 'loading' ? 'Connecting…' : type === 'showing' ? 'Request Showing →' : type === 'ai' ? '📞 Call Me Now' : 'Send Request →'}
            </button>

            <p style={{ margin: '16px 0 0', fontSize: '10px', color: '#bbb', textAlign: 'center', lineHeight: 1.5 }}>
              Brokered by <strong style={{ color: '#da291c' }}>eXp Realty Canada</strong>. Your information is protected and will only be used to process this request.
            </p>
          </form>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)) } to { opacity: 1; transform: translate(-50%, -50%) } }
      `}</style>
    </>
  );
}
