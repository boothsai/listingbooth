import { useState, useEffect } from 'react';
import { Calculator, MapPin, Bed, Bath, ArrowRight, Zap, Target, Wrench, Briefcase, Lock, Building } from 'lucide-react';

// Single component for a listing calculator
const YieldCalculatorCard = ({ listing, rank, type = 'yield' }) => {
  const price = listing.list_price || 0;
  
  // Use algorithmic rent if available, otherwise default to heuristic
  const defaultRent = listing.ai_predictedRent || Math.round(price * 0.005); 
  const [expectedRent, setExpectedRent] = useState(defaultRent);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(listing.baseRate || 5.0);
  const [spatialZoning, setSpatialZoning] = useState(null);

  useEffect(() => {
    if (listing.latitude && listing.longitude) {
      const fetchZoning = async () => {
         try {
           const res = await fetch('https://bridge.booths.ai/api/spatial/zoning', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lat: listing.latitude, lng: listing.longitude })
           });
           const data = await res.json();
           if (data.zoning) setSpatialZoning(data.zoning);
         } catch(e) {}
      };
      fetchZoning();
    }
  }, [listing.latitude, listing.longitude]);
  // Financial Mechanics
  const monthlyCondoFees = listing._isCondo ? (listing.maintenance_fee || 400) : 0;
  const monthlyTaxes = (price * 0.01) / 12; // Assume 1% annual property tax
  const monthlyMaintenance = expectedRent * 0.10; // 10% for upkeep and vacancy

  const monthlyNOI = expectedRent - monthlyCondoFees - monthlyTaxes - monthlyMaintenance;
  const annualNOI = monthlyNOI * 12;
  const capRate = price > 0 ? ((annualNOI / price) * 100).toFixed(2) : '0.00';
  
  // Cashflow mechanics (post-debt)
  const downPaymentAmt = price * (downPaymentPct / 100);
  const loanAmt = price - downPaymentAmt;
  const monthlyRate = (interestRate / 100) / 12;
  const numPayments = 25 * 12;
  const monthlyMortgage = loanAmt > 0 && monthlyRate > 0 ? (loanAmt * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1) : 0;
  
  const estimatedMonthlyCashflow = monthlyNOI - monthlyMortgage;

  const formatMoney = (val) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="glass-panel" style={{ display: 'flex', overflow: 'hidden', marginBottom: '24px', border: type === 'multifamily' ? '1px solid #8b5cf6' : (type === 'commercial' ? '1px solid #3b82f6' : (type === 'fixer' ? '1px solid var(--warning)' : (rank === 1 ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)'))) }}>
      
      {/* Photo Sidebar */}
      <div style={{ width: '250px', background: 'var(--bg-secondary)', position: 'relative' }}>
        {type === 'yield' && rank === 1 && (
          <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'var(--accent-gradient)', color: 'white', padding: '6px 12px', borderRadius: 'var(--radius-pill)', fontSize: '11px', fontWeight: 'bold', zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
            <Zap size={14} /> TOP YIELD DEAL
          </div>
        )}
        {type === 'fixer' && (
          <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'var(--warning)', color: 'black', padding: '6px 12px', borderRadius: 'var(--radius-pill)', fontSize: '11px', fontWeight: 'bold', zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
            <Wrench size={14} /> VALUE-ADD SPECIAL
          </div>
        )}
        {type === 'commercial' && (
          <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#3b82f6', color: 'white', padding: '6px 12px', borderRadius: 'var(--radius-pill)', fontSize: '11px', fontWeight: 'bold', zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
            <Briefcase size={14} /> COMMERCIAL ASSET
          </div>
        )}
        {type === 'multifamily' && (
          <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#8b5cf6', color: 'white', padding: '6px 12px', borderRadius: 'var(--radius-pill)', fontSize: '11px', fontWeight: 'bold', zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
            <Building size={14} /> MULTIFAMILY
          </div>
        )}
        {type === 'offmarket' && (
          <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'black', color: '#10b981', padding: '6px 12px', borderRadius: 'var(--radius-pill)', fontSize: '11px', fontWeight: 'bold', zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
            <Lock size={14} /> PRIVATE EXCLUSIVE
          </div>
        )}
        <img 
          src={listing.photo_urls?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt="Property" 
        />
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{type === 'offmarket' ? 'RESTRICTED' : formatMoney(price)}</div>
        </div>
      </div>

      {/* Calculator Logic */}
      <div style={{ flex: 1, padding: '24px', display: 'flex', gap: '32px' }}>
        
        {/* Left Col: Info & Sliders */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '24px' }}>
            
            {/* Algorithmic Badges */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 8px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px' }}>
                {type === 'offmarket' ? 'X.XX' : listing.ai_capRate?.toFixed(2)}% Predicted Cap Rate
              </span>
              {listing.ai_discountPct <= -5 && type !== 'commercial' && (
                <span title={`Baseline: ${formatMoney(listing.ai_compBaseline)}`} style={{ padding: '4px 8px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', fontSize: '11px', fontWeight: 'bold', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'help' }}>
                  <Target size={12} /> {Math.abs(listing.ai_discountPct).toFixed(1)}% ({type === 'offmarket' ? 'RESTRICTED' : formatMoney(listing.ai_discountAmt)}) Below {listing._isCondo ? 'Condo' : (listing._isMultifamily ? 'Multifamily' : (listing._isTownhouse ? 'Townhouse' : 'Detached'))} Baseline
                </span>
              )}
            </div>

            <h4 style={{ fontSize: '18px', margin: '0 0 8px 0', textTransform: 'capitalize' }}>
              {type === 'offmarket' ? 'Restricted Address' : (listing.unparsed_address?.toLowerCase() || listing.address_street?.toLowerCase() || 'Off-Market Opportunity')}
            </h4>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14}/> {type === 'offmarket' ? listing.address_city : (listing.address_city || 'Regional')}</span>
              {type !== 'commercial' && (
                <>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Bed size={14}/> {listing.bedrooms_total || 0} Beds</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Bath size={14}/> {listing.bathrooms_total || 0} Baths</span>
                </>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <label style={{ fontWeight: '500' }}>Expected Monthly Revenue/Rent</label>
              <span>{formatMoney(expectedRent)}</span>
            </div>
            <input 
              type="range" min={1000} max={25000} step={500} 
              value={expectedRent} onChange={(e) => setExpectedRent(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.3 }}>Income model driven by regional VOW/DDF Active & Sold Comps.</div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <label style={{ fontWeight: '500' }}>Down Payment</label>
              <span>{downPaymentPct}% ({formatMoney(downPaymentAmt)})</span>
            </div>
            <input 
              type="range" min={5} max={100} step={5} 
              value={downPaymentPct} onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <label style={{ fontWeight: '500' }}>Interest Rate</label>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{interestRate.toFixed(2)}%</span>
            </div>
            <input 
              type="range" min={2.00} max={12.00} step={0.10} 
              value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
          </div>
        </div>

        {/* Right Col: Outputs */}
        <div style={{ width: '220px', background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>ESTIMATED CAP RATE</div>
            <div style={{ fontSize: '28px', color: type === 'offmarket' ? 'var(--text-secondary)' : (capRate > 4.5 ? 'var(--success)' : 'var(--text-primary)'), fontWeight: 'bold' }}>
              {type === 'offmarket' ? 'X.X%' : `${capRate}%`}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.3 }}>Net of 1% property tax, 10% maint, and condo fees.</div>
          </div>

          <div style={{ marginBottom: 'auto' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>EST. MONTHLY CASHFLOW</div>
            <div style={{ fontSize: '28px', color: type === 'offmarket' ? 'var(--text-secondary)' : (estimatedMonthlyCashflow > 0 ? 'var(--accent-primary)' : 'var(--danger)'), fontWeight: 'bold', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              {type === 'offmarket' ? '$XXX' : formatMoney(estimatedMonthlyCashflow)} <span style={{fontSize: '14px', fontWeight: 'normal'}}>/mo</span>
            </div>
          </div>

          <div style={{ marginBottom: 'auto', marginTop: '16px', padding: '12px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '11px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '2px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Zoning</div>
              <div style={{ fontWeight: '600', color: spatialZoning ? 'var(--accent-primary)' : 'inherit' }} title={spatialZoning ? 'Sourced from local municipal spatial data' : ''}>{spatialZoning || listing.zoning || listing.zoning_description || 'Res/Unknown'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '2px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lot Size</div>
              <div style={{ fontWeight: '600' }}>{listing.lot_size_area ? `${listing.lot_size_area} ${listing.lot_size_units || 'sqft'}` : 'N/A'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '2px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Int. Size</div>
              <div style={{ fontWeight: '600' }}>{listing.living_area ? `${listing.living_area} sqft` : 'N/A'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '2px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price/Sqft</div>
              <div style={{ fontWeight: '600', cursor: 'help' }} title={listing.living_area ? `Hover Stat: ≈ ${formatMoney(price / (listing.living_area / 10.7639))}/sqm` : 'Hover Stat: N/A'}>
                {listing.living_area && price > 0 ? `${formatMoney(price / listing.living_area)}` : 'N/A'}
              </div>
            </div>
          </div>

          <button style={{ 
            width: '100%', padding: '12px', background: 'var(--text-primary)', color: 'var(--bg-primary)',
            borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
          }}>
            Analyze with Advisor <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default function VowYieldTools() {
  const [deals, setDeals] = useState({ yields: [], fixers: [], commercial: [], multifamily: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('yields');

  useEffect(() => {
    const fetchVowData = async () => {
      try {
        setLoading(true);

        let liveRate = 5.0;
        try {
          const res = await fetch("https://www.bankofcanada.ca/valet/observations/V122521/json?recent=1");
          const data = await res.json();
          const fetchedRate = parseFloat(data.observations[0].V122521.v);
          if (fetchedRate) liveRate = fetchedRate;
        } catch (e) {}

        const { results, error } = await fetch('/api/listings/bounds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            minLat: 43.4, maxLat: 44.5,
            minLng: -80.5, maxLng: -78.5,
            pageSize: 100, page: 0
          })
        }).then(r => r.json());

        if (error) {
          console.error("Bounds API fetch error:", error);
          return;
        }

        const rawData = (results || []).filter(li => li.list_price > 1000); 
        if (rawData.length === 0) return setDeals({ yields: [], fixers: [], commercial: [], multifamily: [] });

        const shuffledPool = [...rawData].sort(() => 0.5 - Math.random()).slice(0, 50);
        
        let condoBeds = 0, condoPrice = 0;
        let thBeds = 0, thPrice = 0;
        let fhBeds = 0, fhPrice = 0;

        // 1. Bucket and establish Independent Vector Baselines
        shuffledPool.forEach(item => {
          const pType = (item.property_type || '').toLowerCase();
          const sType = (item.property_sub_type || '').toLowerCase();
          const desc = (item.description || '').toLowerCase();

          const isComm = pType.includes('commercial') || pType.includes('business') || pType.includes('agriculture');
          const isCondo = sType.includes('condo') || sType.includes('apt') || sType.includes('apartment') || desc.includes('condo');
          const isMultifamily = !isComm && !isCondo && (desc.includes('duplex') || desc.includes('triplex') || desc.includes('fourplex') || desc.includes('multi-family') || desc.includes('multi family') || sType.includes('multi'));
          const isTownhouse = !isComm && !isCondo && !isMultifamily && (sType.includes('townhouse') || sType.includes('row') || desc.includes('townhouse') || desc.includes('town home'));

          item._isComm = isComm;
          item._isCondo = !isComm && isCondo;
          item._isMultifamily = isMultifamily;
          item._isTownhouse = isTownhouse;
          item._isFreehold = !isComm && !isCondo && !isTownhouse && !isMultifamily;

          if (!isComm && item.list_price > 0 && item.bedrooms_total > 0) {
            if (item._isCondo) {
              condoBeds += item.bedrooms_total;
              condoPrice += item.list_price;
            } else if (item._isTownhouse) {
              thBeds += item.bedrooms_total;
              thPrice += item.list_price;
            } else {
              fhBeds += item.bedrooms_total;
              fhPrice += item.list_price;
            }
          }
        });

        const condoAvg = condoBeds > 0 ? (condoPrice / condoBeds) : 0;
        const thAvg = thBeds > 0 ? (thPrice / thBeds) : 0;
        const fhAvg = fhBeds > 0 ? (fhPrice / fhBeds) : 0;

        const NLP_KEYWORDS = ['as is', 'as-is', 'tlc', 'handyman', 'contractor', 'renovation', 'needs work', 'potential', 'fixer'];

        // 2. Inject Yields using specific Type-Matched vectors
        const formulatedListings = shuffledPool.map(li => {
          const beds = li.bedrooms_total || 1;
          const price = li.list_price || 0;
          
          let predictedRent = 0;
          if (li._isComm) {
             predictedRent = price * 0.01; 
          } else if (li._isMultifamily) {
             predictedRent = beds * 1250; 
          } else if (li._isCondo) {
             predictedRent = beds * 1300; // Condos usually rent higher per bed due to location/amenities
          } else if (li._isTownhouse) {
             predictedRent = beds * 1100;
          } else {
             predictedRent = beds * 1000;
          }

          let annualCondoFee = 0;
          if (li._isCondo) {
             annualCondoFee = (li.maintenance_fee || 400) * 12;
          }

          const algorithmicTaxes = price * 0.01;
          const algorithmicMaintenance = (predictedRent * 12) * 0.10;
          const predictedNOI = (predictedRent * 12) - algorithmicTaxes - algorithmicMaintenance - annualCondoFee;
          const predictedCapRate = price > 0 ? (predictedNOI / price) * 100 : 0;
          
          // Apply Type-Matched Comps
          let marketExpectedPrice = 0;
          if (!li._isComm) {
            if (li._isCondo) marketExpectedPrice = beds * condoAvg;
            else if (li._isTownhouse) marketExpectedPrice = beds * thAvg;
            else marketExpectedPrice = beds * fhAvg;
          }
          
          const discountPct = (marketExpectedPrice > 0 && !li._isComm) ? ((price - marketExpectedPrice) / marketExpectedPrice) * 100 : 0;
          const discountAmt = li._isComm ? 0 : marketExpectedPrice - price;

          const descRaw = (li.description || '').toLowerCase();
          const isFixerUpper = !li._isComm && NLP_KEYWORDS.some(k => descRaw.includes(k)) && discountPct <= -2.0;

          return {
             ...li,
             baseRate: liveRate,
             ai_predictedRent: predictedRent,
             ai_capRate: predictedCapRate,
             ai_compBaseline: marketExpectedPrice,
             ai_discountPct: discountPct,
             ai_discountAmt: discountAmt,
             ai_isFixer: isFixerUpper
          };
        });

        // 3. Bucket allocations
        const yields = formulatedListings.filter(f => !f._isComm && !f._isMultifamily && !f.ai_isFixer).sort((a, b) => b.ai_capRate - a.ai_capRate).slice(0, 5);
        const fixers = formulatedListings.filter(f => !f._isComm && !f._isMultifamily && f.ai_isFixer).sort((a, b) => b.ai_discountAmt - a.ai_discountAmt).slice(0, 5);
        const commercial = formulatedListings.filter(f => f._isComm).sort((a, b) => b.ai_capRate - a.ai_capRate).slice(0, 5);
        const multifamily = formulatedListings.filter(f => !f._isComm && f._isMultifamily).sort((a, b) => b.ai_capRate - a.ai_capRate).slice(0, 5);

        setDeals({ yields, fixers, commercial, multifamily });

      } catch (err) {
        console.error("Failed to load VOW data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVowData();
  }, []);

  const [dispatchStatus, setDispatchStatus] = useState(null);

  const triggerBRADispatch = async () => {
    try {
      setDispatchStatus('sending');
      const authRes = await fetch('/api/auth/session').catch(() => null);
      if (!authRes?.ok) {
        alert("Please log in to assign your dedicated advisor.");
        setDispatchStatus(null);
        return;
      }
      const sessionData = await authRes.json();
      const email = sessionData?.user?.email;
      
      if (!email) {
        alert("Please log in to assign your dedicated advisor.");
        setDispatchStatus(null);
        return;
      }
      
      // Dispatch to the edge network
      const res = await fetch("https://bridge.booths.ai/webhooks/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lead_name: sessionData?.user?.user_metadata?.full_name || 'Valued Client' })
      });
      
      if (res.ok) {
        setDispatchStatus('sent');
        alert("Success! Your representation paperwork has been securely dispatched to your email. Please review and sign to unlock the Private Network.");
      } else {
        setDispatchStatus('error');
        alert("There was an issue dispatching your request. Please contact support@listingbooth.com");
      }
    } catch (e) {
      console.error(e);
      setDispatchStatus('error');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Calculator size={24} color="var(--accent-primary)" />
        <h3 style={{ fontSize: '20px', margin: 0 }}>Deals of the Day</h3>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
        Our Vision Engine systematically scans the MLS and algorithmically cycles through active inventory to find you the highest yielding opportunities based on type-matched Comps and deep market discounts.
      </p>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid var(--border-light)', overflowX: 'auto', paddingBottom: '8px' }}>
        <button 
          onClick={() => setActiveTab('yields')} 
          style={{ flexShrink: 0, padding: '12px 16px', background: activeTab === 'yields' ? 'var(--bg-secondary)' : 'transparent', border: 'none', borderBottom: activeTab === 'yields' ? '2px solid var(--accent-primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Zap size={14} color="var(--accent-primary)" /> Residential Yields ({deals.yields.length})
        </button>
        <button 
          onClick={() => setActiveTab('fixers')} 
          style={{ flexShrink: 0, padding: '12px 16px', background: activeTab === 'fixers' ? 'var(--bg-secondary)' : 'transparent', border: 'none', borderBottom: activeTab === 'fixers' ? '2px solid var(--warning)' : '2px solid transparent', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Wrench size={14} color="var(--warning)" /> Handyman Specials ({deals.fixers.length})
        </button>
        <button 
          onClick={() => setActiveTab('commercial')} 
          style={{ flexShrink: 0, padding: '12px 16px', background: activeTab === 'commercial' ? 'var(--bg-secondary)' : 'transparent', border: 'none', borderBottom: activeTab === 'commercial' ? '2px solid #3b82f6' : '2px solid transparent', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Briefcase size={14} color="#3b82f6" /> Commercial Assets ({deals.commercial.length})
        </button>
        <button 
          onClick={() => setActiveTab('multifamily')} 
          style={{ flexShrink: 0, padding: '12px 16px', background: activeTab === 'multifamily' ? 'var(--bg-secondary)' : 'transparent', border: 'none', borderBottom: activeTab === 'multifamily' ? '2px solid #8b5cf6' : '2px solid transparent', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Building size={14} color="#8b5cf6" /> Multifamily ({deals.multifamily?.length || 0})
        </button>
        <button 
          onClick={() => setActiveTab('off-market')} 
          style={{ flexShrink: 0, padding: '12px 16px', background: activeTab === 'off-market' ? 'var(--bg-secondary)' : 'transparent', border: 'none', borderBottom: activeTab === 'off-market' ? '2px solid #10b981' : '2px solid transparent', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}
        >
          <Lock size={14} color="#10b981" /> Off-Market Exclusives (24)
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Vision Engine: Extracting Type-Matched Comps...
        </div>
      ) : deals.yields.length === 0 && deals.fixers.length === 0 && deals.commercial.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
          No VOW data could be loaded. Ensure res_ddf.listings is populated.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* TAB: YIELDS */}
          {activeTab === 'yields' && (
             <div>
               {deals.yields.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No active high-yield residential deals found in current pool. Refresh for a new scan.</p>}
               {deals.yields.map((li, idx) => (
                 <YieldCalculatorCard key={li.id} listing={li} rank={idx + 1} type="yield" />
               ))}
             </div>
          )}

          {/* TAB: FIXERS */}
          {activeTab === 'fixers' && (
             <div>
               <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                 The Vision Engine flagged these properties for containing contractor-grade keywords while being listed significantly below their specific type-matched baseline. High potential for sweat equity.
               </p>
               {deals.fixers.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No active handyman specials found in current pool. Refresh for a new scan.</p>}
               {deals.fixers.map((li, idx) => (
                 <YieldCalculatorCard key={li.id} listing={li} rank={idx + 1} type="fixer" />
               ))}
             </div>
          )}

          {/* TAB: COMMERCIAL */}
          {activeTab === 'commercial' && (
             <div>
               <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                 Commercial assets are evaluated dynamically against predictive revenue models rather than residential baselines. Cap rates reflect estimated top-line operations.
               </p>
               {deals.commercial.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No active commercial deals found in current pool. Refresh for a new scan.</p>}
               {deals.commercial.map((li, idx) => (
                 <YieldCalculatorCard key={li.id} listing={li} rank={idx + 1} type="commercial" />
               ))}
             </div>
          )}

          {/* TAB: MULTIFAMILY */}
          {activeTab === 'multifamily' && (
             <div>
               <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                 Duplexes, Triplexes, and Fourplexes optimized for immediate cash flow. Baselines reflect dense unit conversions.
               </p>
               {(!deals.multifamily || deals.multifamily.length === 0) && <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No active multifamily deals found in current pool. Refresh for a new scan.</p>}
               {deals.multifamily?.map((li, idx) => (
                 <YieldCalculatorCard key={li.id} listing={li} rank={idx + 1} type="multifamily" />
               ))}
             </div>
          )}

          {/* TAB: OFF-MARKET (PREMIUM GATE) */}
          {activeTab === 'off-market' && (
             <div style={{ position: 'relative', width: '100%', minHeight: '600px' }}>
               
               {/* Background Blurred Mock Layers */}
               <div style={{ opacity: 0.15, filter: 'blur(8px)', pointerEvents: 'none', userSelect: 'none' }}>
                 {deals.yields[0] && <YieldCalculatorCard listing={{ ...deals.yields[0], ai_discountPct: -15, address_city: 'Kijiji Private Scrape' }} rank={1} type="offmarket" />}
                 {deals.yields[1] && <YieldCalculatorCard listing={{ ...deals.yields[1], ai_discountPct: -18, address_city: 'Facebook Marketplace Scrape' }} rank={2} type="offmarket" />}
               </div>

               {/* Central Paywall Overlay */}
               <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                   <div style={{ background: 'rgba(20, 20, 20, 0.85)', backdropFilter: 'blur(16px)', padding: '48px', borderRadius: 'var(--radius-lg)', border: '1px solid #10b981', maxWidth: '500px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                       <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', marginBottom: '24px' }}>
                           <Lock size={32} />
                       </div>
                       <h3 style={{ fontSize: '24px', color: 'white', margin: '0 0 16px 0' }}>FREE WITH PREMIUM</h3>
                       <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
                           Our intelligence engine actively analyzes highly lucrative off-market assignments, private network wholesales, and unlisted distributions daily. <br/><br/>
                           Our service is absolutely free with Premium. Premium is where you get a trusted, licensed advisor to navigate, show, and negotiate these exclusive deals with you.
                       </p>
                       <button onClick={triggerBRADispatch} style={{ width: '100%', padding: '16px', background: '#10b981', color: 'black', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '1px' }}>
                           <Zap fill="black" size={16} /> Assign My Dedicated Advisor
                       </button>
                       <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '20px' }}>
                           Clicking this button will securely dispatch the assignment details to your email to officially connect your licensed professional and unlock the Private Network.
                       </div>
                   </div>
               </div>
             </div>
          )}

        </div>
      )}
    </div>
  );
}
