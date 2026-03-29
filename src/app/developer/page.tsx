'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DeveloperPortalPage() {
  const [form, setForm] = useState({
    company_name: '', contact_name: '', email: '', phone: '',
    website: '', community_name: '', city: '', units: '',
    price_range: '', property_types: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.company_name || !form.email || !form.contact_name) {
      alert('Please fill in Company Name, Contact Name, and Email.');
      return;
    }
    setSending(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.contact_name,
          email: form.email,
          phone: form.phone || null,
          lead_type: 'Developer Inquiry — New Construction',
          listing_key: 'developer-portal',
          address: `${form.community_name || 'New Community'} by ${form.company_name}`,
          price: 0,
          message: `Developer Portal Submission\n\nCompany: ${form.company_name}\nWebsite: ${form.website}\nCommunity: ${form.community_name}\nCity: ${form.city}\nUnits: ${form.units}\nPrice Range: ${form.price_range}\nProperty Types: ${form.property_types}\n\nNotes: ${form.message}`,
        }),
      });
    } catch { /* non-blocking */ }
    setSending(false);
    setSubmitted(true);
  };

  const inputStyle = {
    width: '100%', padding: '16px', borderRadius: '12px',
    background: 'white', border: '1.5px solid #eee', color: '#111',
    fontSize: '15px', outline: 'none', fontWeight: 500 as const,
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '120px 24px 80px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#888' }}>
        <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
        <span>›</span>
        <Link href="/new-construction" style={{ color: '#888', textDecoration: 'none' }}>New Construction</Link>
        <span>›</span>
        <span style={{ color: '#111' }}>Developer Portal</span>
      </div>

      {/* Hero */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(218,41,28,0.08)', color: '#da291c', padding: '6px 14px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', border: '1px solid rgba(218,41,28,0.1)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M9 21V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v15"/><path d="M5 21V12a1 1 0 0 1 1-1h2"/><path d="M19 21V12a1 1 0 0 0-1-1h-2"/></svg>
          Developer Portal
        </div>
        <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#111', letterSpacing: '-2px', lineHeight: 1.1 }}>
          List Your Development
        </h1>
        <p style={{ margin: 0, fontSize: '18px', color: '#888', fontWeight: 500, lineHeight: 1.6 }}>
          Submit your new construction community for inclusion on ListingBooth.com. Our team will verify your builder credentials, score your project, and launch your listing within 48 hours.
        </p>
      </div>

      {submitted ? (
        /* Success state */
        <div style={{ textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: '24px', border: '1.5px solid #eee' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
          <h2 style={{ margin: '0 0 12px', fontSize: '28px', fontWeight: 900, color: '#111' }}>Submission Received</h2>
          <p style={{ margin: '0 0 32px', fontSize: '16px', color: '#666', lineHeight: 1.6, maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
            Our builder partnerships team will review your submission and respond within 48 hours. You&apos;ll receive a confirmation email at <strong>{form.email}</strong>.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/new-construction" style={{ background: '#111', color: 'white', padding: '14px 28px', borderRadius: '12px', fontSize: '14px', fontWeight: 800, textDecoration: 'none' }}>
              Browse Projects
            </Link>
            <button onClick={() => { setSubmitted(false); setForm({ company_name: '', contact_name: '', email: '', phone: '', website: '', community_name: '', city: '', units: '', price_range: '', property_types: '', message: '' }); }} style={{ background: '#f5f5f5', color: '#111', padding: '14px 28px', borderRadius: '12px', fontSize: '14px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
              Submit Another
            </button>
          </div>
        </div>
      ) : (
        /* Form */
        <div style={{ background: 'white', borderRadius: '24px', border: '1.5px solid #eee', overflow: 'hidden' }}>
          {/* Section 1: Company Info */}
          <div style={{ padding: '40px', borderBottom: '1px solid #eee' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 900, color: '#111', letterSpacing: '-0.3px' }}>
              <span style={{ color: '#da291c', marginRight: '8px' }}>01</span>Company Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <input placeholder="Company / Builder Name *" value={form.company_name} onChange={e => update('company_name', e.target.value)} style={inputStyle} />
              <input placeholder="Contact Person *" value={form.contact_name} onChange={e => update('contact_name', e.target.value)} style={inputStyle} />
              <input type="email" placeholder="Business Email *" value={form.email} onChange={e => update('email', e.target.value)} style={inputStyle} />
              <input type="tel" placeholder="Phone Number" value={form.phone} onChange={e => update('phone', e.target.value)} style={inputStyle} />
              <input placeholder="Website URL" value={form.website} onChange={e => update('website', e.target.value)} style={{ ...inputStyle, gridColumn: 'span 2' }} />
            </div>
          </div>

          {/* Section 2: Project Details */}
          <div style={{ padding: '40px', borderBottom: '1px solid #eee' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 900, color: '#111', letterSpacing: '-0.3px' }}>
              <span style={{ color: '#da291c', marginRight: '8px' }}>02</span>Project Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <input placeholder="Community / Project Name" value={form.community_name} onChange={e => update('community_name', e.target.value)} style={inputStyle} />
              <input placeholder="City (e.g. Toronto, Ottawa)" value={form.city} onChange={e => update('city', e.target.value)} style={inputStyle} />
              <input placeholder="Total Units (e.g. 200)" value={form.units} onChange={e => update('units', e.target.value)} style={inputStyle} />
              <input placeholder="Price Range (e.g. $500K - $1.2M)" value={form.price_range} onChange={e => update('price_range', e.target.value)} style={inputStyle} />
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#888', marginBottom: '8px' }}>Property Types Available</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Condos', 'Townhomes', 'Detached', 'Semi-Detached', 'Stacked Towns'].map(type => {
                    const isSelected = form.property_types.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          const types = form.property_types ? form.property_types.split(', ') : [];
                          if (isSelected) {
                            update('property_types', types.filter(t => t !== type).join(', '));
                          } else {
                            update('property_types', [...types, type].join(', '));
                          }
                        }}
                        style={{
                          padding: '8px 16px', borderRadius: '100px', border: isSelected ? '1.5px solid #da291c' : '1.5px solid #eee',
                          background: isSelected ? 'rgba(218,41,28,0.08)' : 'white', color: isSelected ? '#da291c' : '#666',
                          fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                        }}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Additional */}
          <div style={{ padding: '40px' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 900, color: '#111', letterSpacing: '-0.3px' }}>
              <span style={{ color: '#da291c', marginRight: '8px' }}>03</span>Additional Notes
            </h3>
            <textarea
              placeholder="Tell us about your project — timeline, special features, VIP incentives, etc."
              value={form.message}
              onChange={e => update('message', e.target.value)}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={handleSubmit}
                disabled={sending}
                style={{
                  background: '#da291c', color: 'white', padding: '18px 40px', borderRadius: '12px',
                  fontSize: '16px', fontWeight: 900, border: 'none', cursor: sending ? 'wait' : 'pointer',
                  transition: 'transform 0.2s', letterSpacing: '-0.3px', opacity: sending ? 0.7 : 1,
                }}
                onMouseEnter={e => !sending && (e.currentTarget.style.transform = 'scale(1.03)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {sending ? 'Submitting...' : 'Submit for Review'}
              </button>
              <span style={{ fontSize: '13px', color: '#888', fontWeight: 500 }}>
                Free to list · No upfront fees
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Trust badges */}
      <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
        {[
          { icon: '🛡️', label: 'HCRA Verified' },
          { icon: '✅', label: 'Tarion Enrolled' },
          { icon: '🏆', label: 'Builder Score™ Certified' },
          { icon: '📈', label: '5,000+ Monthly Visitors' },
        ].map((badge, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#999' }}>
            <span>{badge.icon}</span> {badge.label}
          </div>
        ))}
      </div>
    </div>
  );
}
