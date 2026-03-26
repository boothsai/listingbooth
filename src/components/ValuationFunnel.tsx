'use client';

import { useState, useEffect } from 'react';

type Step = 'Address' | 'PropertyType' | 'Timeline' | 'Contact' | 'Complete';

export default function ValuationFunnel() {
  const [step, setStep] = useState<Step>('Address');
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const [propertyType, setPropertyType] = useState('');
  const [timeline, setTimeline] = useState('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // Address Autocomplete Logic
  useEffect(() => {
    if (address.length < 4 || step !== 'Address') {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&countrycodes=ca,us&limit=4`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.map((item: any) => item.display_name.split(', ').slice(0, 3).join(', ')));
        }
      } catch {
        setSuggestions([]);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [address, step]);

  async function submitLead() {
    // Basic email format guard
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          lead_type: 'Seller Valuation Request',
          address,
          message: `Property Type: ${propertyType}\nTimeline: ${timeline}`,
        }),
      });
      setStep('Complete');
    } catch (e) {
      console.error(e);
      alert('Failed to submit, please try again.');
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', background: 'white', borderRadius: '24px', boxShadow: '0 24px 64px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      
      {/* Progress Bar */}
      {step !== 'Complete' && (
        <div style={{ width: '100%', height: '6px', background: '#f5f5f5' }}>
          <div style={{ 
            height: '100%', background: '#da291c', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            width: step === 'Address' ? '25%' : step === 'PropertyType' ? '50%' : step === 'Timeline' ? '75%' : '95%'
          }} />
        </div>
      )}

      <div style={{ padding: '48px' }}>
        
        {/* STEP 1: Address */}
        {step === 'Address' && (
          <div className="fade-in">
            <h2 style={{ margin: '0 0 12px', fontSize: '32px', fontWeight: 900, color: '#111', letterSpacing: '-1px', lineHeight: 1.1 }}>Where is your home located?</h2>
            <p style={{ margin: '0 0 32px', fontSize: '16px', color: '#666', lineHeight: 1.5 }}>
              Enter your address to instantly analyze local market data, recent sales, and DDF® algorithmic trends.
            </p>
            
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#fdfdfd', border: '2px solid #e5e5e5', borderRadius: '12px', padding: '4px 8px 4px 20px', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <span style={{ fontSize: '20px' }}>📍</span>
                <input 
                  type="text" 
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. 123 Main St, Ottawa..."
                  style={{ flex: 1, padding: '16px', border: 'none', background: 'transparent', outline: 'none', fontSize: '18px', fontWeight: 600, color: '#111', fontFamily: 'var(--font-inter), sans-serif' }}
                />
              </div>

              {suggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '2px solid #eee', borderTop: 'none', borderRadius: '0 0 12px 12px', boxShadow: '0 12px 24px rgba(0,0,0,0.08)', zIndex: 10, marginTop: '-4px', paddingTop: '4px', overflow: 'hidden' }}>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setAddress(s); setStep('PropertyType'); }}
                      style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', background: 'white', border: 'none', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                      <span style={{ width: '8px', height: '8px', background: '#da291c', borderRadius: '50%' }} />
                      <span style={{ fontSize: '15px', fontWeight: 600, color: '#111' }}>{s}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Property Type */}
        {step === 'PropertyType' && (
          <div className="fade-in">
            <h2 style={{ margin: '0 0 12px', fontSize: '32px', fontWeight: 900, color: '#111', letterSpacing: '-1px', lineHeight: 1.1 }}>What type of home is it?</h2>
            <p style={{ margin: '0 0 32px', fontSize: '16px', color: '#666', lineHeight: 1.5 }}>
              This helps our algorithm pull identical comparables in your neighborhood.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {['Single Family', 'Townhouse / Row', 'Condo / Apartment', 'Multi-Family', 'Land / Lot', 'Other'].map(type => (
                <button
                  key={type}
                  onClick={() => { setPropertyType(type); setStep('Timeline'); }}
                  style={{
                    padding: '24px', background: '#fdfdfd', border: '2px solid #eaeaea', borderRadius: '12px',
                    fontSize: '16px', fontWeight: 700, color: '#333', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#da291c'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#eaeaea'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  {type}
                </button>
              ))}
            </div>
            <button onClick={() => setStep('Address')} style={{ marginTop: '24px', background: 'none', border: 'none', color: '#888', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>← Back to Address</button>
          </div>
        )}

        {/* STEP 3: Timeline */}
        {step === 'Timeline' && (
          <div className="fade-in">
            <h2 style={{ margin: '0 0 12px', fontSize: '32px', fontWeight: 900, color: '#111', letterSpacing: '-1px', lineHeight: 1.1 }}>When are you thinking of selling?</h2>
            <p style={{ margin: '0 0 32px', fontSize: '16px', color: '#666', lineHeight: 1.5 }}>
              We'll factor in predictive seasonal adjustments to estimate your best listing window.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { time: 'ASAP', desc: 'I need to sell immediately.' },
                { time: '1 - 3 Months', desc: 'Preparing my home for the market.' },
                { time: '3 - 6 Months', desc: 'Just starting the research phase.' },
                { time: "Just Curious", desc: 'Not selling, just tracking my equity.' },
              ].map(t => (
                <button
                  key={t.time}
                  onClick={() => { setTimeline(t.time); setStep('Contact'); }}
                  style={{
                    padding: '20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    background: '#fdfdfd', border: '2px solid #eaeaea', borderRadius: '12px',
                    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#da291c'; e.currentTarget.style.background = '#fff8f8' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#eaeaea'; e.currentTarget.style.background = '#fdfdfd' }}
                >
                  <span style={{ fontSize: '17px', fontWeight: 800, color: '#111', marginBottom: '4px' }}>{t.time}</span>
                  <span style={{ fontSize: '14px', color: '#666' }}>{t.desc}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setStep('PropertyType')} style={{ marginTop: '24px', background: 'none', border: 'none', color: '#888', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>← Back to Property Type</button>
          </div>
        )}

        {/* STEP 4: Contact Wall */}
        {step === 'Contact' && (
          <div className="fade-in">
            <h2 style={{ margin: '0 0 12px', fontSize: '32px', fontWeight: 900, color: '#111', letterSpacing: '-1px', lineHeight: 1.1 }}>Your report is ready!</h2>
            <p style={{ margin: '0 0 32px', fontSize: '16px', color: '#666', lineHeight: 1.5 }}>
              Where should we send your comprehensive CMA report and AI Valuation?
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Full Name *</label>
                <input 
                  type="text" value={name} onChange={e => setName(e.target.value)} required
                  style={{ width: '100%', padding: '16px', border: '2px solid #e5e5e5', borderRadius: '8px', fontSize: '16px', outline: 'none', background: '#fdfdfd' }}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Email Address *</label>
                <input 
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  style={{ width: '100%', padding: '16px', border: '2px solid #e5e5e5', borderRadius: '8px', fontSize: '16px', outline: 'none', background: '#fdfdfd' }}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Phone Number</label>
                <input 
                  type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '16px', border: '2px solid #e5e5e5', borderRadius: '8px', fontSize: '16px', outline: 'none', background: '#fdfdfd' }}
                  placeholder="(555) 555-5555"
                />
              </div>
            </div>

            <button 
              onClick={submitLead}
              disabled={loading || !name || !email}
              style={{
                width: '100%', padding: '20px', background: '#da291c', color: 'white', border: 'none',
                borderRadius: '12px', fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                cursor: (loading || !name || !email) ? 'not-allowed' : 'pointer', opacity: (loading || !name || !email) ? 0.6 : 1,
                boxShadow: '0 12px 24px rgba(218,41,28,0.25)', transition: 'all 0.2s'
              }}
            >
              {loading ? 'Generating Report...' : 'Unlock My Valuation'}
            </button>
            
            <p style={{ margin: '16px 0 0', fontSize: '11px', color: '#999', textAlign: 'center' }}>
              By submitting, you agree to our Terms of Use and consent to be contacted by an eXp Realty agent.
            </p>
          </div>
        )}

        {/* STEP 5: Success */}
        {step === 'Complete' && (
          <div className="fade-in" style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: '80px', height: '80px', background: '#eefcf1', borderRadius: '50%', color: '#22c55e', fontSize: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              ✓
            </div>
            <h2 style={{ margin: '0 0 12px', fontSize: '32px', fontWeight: 900, color: '#111', letterSpacing: '-1px' }}>Analysis Complete!</h2>
            <p style={{ margin: '0 0 32px', fontSize: '16px', color: '#666', lineHeight: 1.6 }}>
              Our AI engine has finished processing records for <strong>{address}</strong>.<br/><br/>
              An active DDF dashboard and CMA report has been emailed to <strong>{email}</strong>.
            </p>
            <button 
              onClick={() => window.location.href = '/agent'}
              style={{ padding: '16px 32px', background: '#111', color: 'white', borderRadius: '100px', border: 'none', fontWeight: 800, cursor: 'pointer' }}
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
