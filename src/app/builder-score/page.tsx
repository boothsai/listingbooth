import Link from 'next/link';

export default function BuilderScorePage() {
  return (
    <div style={{ backgroundColor: '#fff', color: '#111', padding: '120px 24px 80px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Navigation & Header */}
        <div style={{ marginBottom: '48px' }}>
          <Link href="/new-construction" className="hover:text-[#111]" style={{ color: '#888', textDecoration: 'none', fontSize: '14px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px', transition: 'color 0.2s' }}>
            ← Back to Projects
          </Link>
          <div style={{ display: 'inline-flex', padding: '6px 14px', borderRadius: '100px', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '24px', border: '1px solid rgba(16,185,129,0.2)' }}>
            Proprietary Metric
          </div>
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1.1, margin: '0 0 24px' }}>
            The Builder Score Methodology.
          </h1>
          <p style={{ fontSize: '20px', color: '#555', lineHeight: 1.6, fontWeight: 500, margin: 0 }}>
            Not all developers are created equal. We built the 100-point <strong>Builder Score</strong> to protect buyers by surfacing public regulatory data, historical warranty claims, and financial standing.
          </p>
        </div>

        {/* The Breakdown */}
        <div style={{ background: '#fafafa', borderRadius: '24px', padding: '40px', border: '1.5px solid #eee', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '24px', letterSpacing: '-0.5px' }}>How it's Calculated</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#111', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900, flexShrink: 0 }}>
                70
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px' }}>Tarion Warranty & Claims History</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '15px', lineHeight: 1.6 }}>
                  The largest chunk of the score is derived from physical build quality and post-occupancy care. We algorithmically analyze the volume of chargeable conciliations (times Tarion had to step in to fix defects the builder ignored) against the total number of homes the builder has delivered over a 10-year period.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900, flexShrink: 0 }}>
                20
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px' }}>HCRA Regulatory Standing</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '15px', lineHeight: 1.6 }}>
                  We scrape Home Construction Regulatory Authority (HCRA) data to detect licensing conditions, disciplinary actions, charges under the NHCLA, and active convictions. A clean regulatory record ensures maximum points here.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#da291c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900, flexShrink: 0 }}>
                10
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px' }}>Project Delivery & Financial Standing</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '15px', lineHeight: 1.6 }}>
                  We track historical project cancellations and excessive occupancy delays. Builders who repeatedly launch projects only to cancel them due to financing failures face severe penalties in this category.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* The Tiers */}
        <div style={{ marginBottom: '64px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '32px', letterSpacing: '-1px' }}>The Trust Tiers</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            <div style={{ borderLeft: '4px solid #10b981', padding: '24px', background: '#fff', border: '1.5px solid #eee', borderRadius: '16px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 900, color: '#10b981' }}>90 - 100: Exceptional</h4>
              <p style={{ margin: 0, fontSize: '15px', color: '#555', lineHeight: 1.6 }}>Platinum-tier developers with thousands of successful deliveries, virtually zero unresolved warranty claims, and pristine financial standing. Safe to invest.</p>
            </div>
            <div style={{ borderLeft: '4px solid #f59e0b', padding: '24px', background: '#fff', border: '1.5px solid #eee', borderRadius: '16px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 900, color: '#f59e0b' }}>70 - 89: Acceptable</h4>
              <p style={{ margin: 0, fontSize: '15px', color: '#555', lineHeight: 1.6 }}>Established builders but may have minor historical infractions, slight project delays, or a slightly higher ratio of Tarion chargeable conciliations.</p>
            </div>
            <div style={{ borderLeft: '4px solid #da291c', padding: '24px', background: '#fff', border: '1.5px solid #eee', borderRadius: '16px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 900, color: '#da291c' }}>Below 70: Caution</h4>
              <p style={{ margin: 0, fontSize: '15px', color: '#555', lineHeight: 1.6 }}>Heavy regulatory scrutiny, historical project cancellations, or poor post-occupancy construction defect rectifications. Proceed with extreme caution.</p>
            </div>
          </div>
        </div>

        {/* Data Source Disclaimer */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '40px' }}>
          <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6 }}>
            <strong>Disclaimer:</strong> The Builder Score is an independent algorithm provided by ListingBooth. It relies on public data aggregated from the Home Construction Regulatory Authority (HCRA) and the Tarion Warranty Corporation. ListingBooth is not affiliated with HCRA or Tarion. The score is a risk-assessment tool and does not guarantee the outcome of any real estate transaction.
          </p>
        </div>
      </div>
    </div>
  );
}
