'use client';

import Link from 'next/link';

const YEAR = new Date().getFullYear();

export default function SiteFooter() {
  return (
    <footer style={{ backgroundColor: '#0a0a0a', color: 'white' }}>
      {/* ── eXp Realty Compliance Bar ─────────────────────────────── */}
      <div style={{
        backgroundColor: '#da291c',
        padding: '14px 40px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '18px',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '13px', fontWeight: 800, color: 'white', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Brokered by eXp Realty
        </span>
        <span style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.4)', display: 'inline-block' }} />
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
          eXp Realty Canada is a registered real estate brokerage.
        </span>
        <span style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.4)', display: 'inline-block' }} />
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
          REALTOR®, REALTORS®, MLS® are controlled by CREA.
        </span>
      </div>

      {/* ── Main Footer ───────────────────────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 40px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px', marginBottom: '56px' }}>

          {/* Brand */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-transparent.png" alt="ListingBooth" style={{ height: '48px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
              <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '24px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
                listing<span style={{ color: '#da291c' }}>booth</span><span style={{ color: 'white' }}>.com</span>
              </span>
            </div>
            <p style={{ color: '#666', fontSize: '14px', maxWidth: '300px', lineHeight: 1.7, margin: '0 0 12px' }}>
              An AI-first real estate portal powered by the BOOTHS.AI™ Mothership.
            </p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', background: '#1a1a1a', border: '1px solid #333', color: '#888', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, letterSpacing: '0.06em' }}>
                BOOTHS.AI Satellite
              </span>
              <span style={{ fontSize: '11px', background: '#1a1a1a', border: '1px solid #333', color: '#888', padding: '4px 10px', borderRadius: '100px', fontWeight: 600, letterSpacing: '0.06em' }}>
                DDF® Member
              </span>
            </div>
          </div>

          {/* Buy & Sell */}
          <div>
            <p style={{ margin: '0 0 16px', fontSize: '11px', fontWeight: 800, color: '#444', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Listings</p>
            {['Buy a Home', 'Sell Your Home', 'Map Search', 'Market Trends', 'Open Houses', 'New Listings'].map(l => (
              <Link key={l} href="#" style={{ display: 'block', color: '#555', fontSize: '13px', fontWeight: 500, textDecoration: 'none', marginBottom: '10px' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#da291c')}
                onMouseLeave={e => (e.currentTarget.style.color = '#555')}>{l}</Link>
            ))}
          </div>

          {/* Tools */}
          <div>
            <p style={{ margin: '0 0 16px', fontSize: '11px', fontWeight: 800, color: '#444', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Tools</p>
            {['Mortgage Calculator', 'Affordability Check', 'Home Value Estimate', 'Find an Agent', 'Platform & API', 'VABOT AI'].map(l => (
              <Link key={l} href="#" style={{ display: 'block', color: '#555', fontSize: '13px', fontWeight: 500, textDecoration: 'none', marginBottom: '10px' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#da291c')}
                onMouseLeave={e => (e.currentTarget.style.color = '#555')}>{l}</Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <p style={{ margin: '0 0 16px', fontSize: '11px', fontWeight: 800, color: '#444', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Legal</p>
            {['Privacy Policy', 'Terms of Use', 'Accessibility', 'Contact Us', 'DDF® Data Terms', 'VOW Agreement'].map(l => (
              <Link key={l} href="#" style={{ display: 'block', color: '#555', fontSize: '13px', fontWeight: 500, textDecoration: 'none', marginBottom: '10px' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#da291c')}
                onMouseLeave={e => (e.currentTarget.style.color = '#555')}>{l}</Link>
            ))}
          </div>
        </div>

        {/* ── DDF / CREA Data Compliance Disclosure ─────────────────── */}
        <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '32px', marginBottom: '24px' }}>
          <p style={{ color: '#3a3a3a', fontSize: '11px', lineHeight: 1.8, margin: '0 0 12px' }}>
            <strong style={{ color: '#555', fontWeight: 700 }}>Data Attribution:</strong>{' '}
            Listing data is supplied by and subject to the copyright of CREA via the Data Distribution Facility (DDF®).
            The trademarks MLS®, Multiple Listing Service®, and the associated logos are owned by The Canadian Real Estate
            Association (CREA) and identify the quality of services provided by real estate professionals who are members
            of CREA. The trademarks REALTOR®, REALTORS®, and the REALTOR® logo are controlled by CREA.
          </p>
          <p style={{ color: '#3a3a3a', fontSize: '11px', lineHeight: 1.8, margin: '0 0 12px' }}>
            <strong style={{ color: '#555', fontWeight: 700 }}>Brokerage:</strong>{' '}
            All real estate services facilitated through this platform are brokered by{' '}
            <strong style={{ color: '#da291c' }}>eXp Realty Canada</strong>, a registered real estate brokerage.
            Individual listings are the property of their respective brokerages. Listing data is
            provided for residential real estate information purposes only and is not a solicitation.
          </p>
          <p style={{ color: '#3a3a3a', fontSize: '11px', lineHeight: 1.8, margin: 0 }}>
            <strong style={{ color: '#555', fontWeight: 700 }}>VOW Compliance:</strong>{' '}
            This website operates as a Virtual Office Website (VOW) in compliance with CREA DDF® data
            distribution rules. Sold price data, private remarks, and automated valuations are available only
            to registered users. Listing availability is subject to change without notice. While the information
            is from sources believed to be reliable, no warranty or representation is made as to its accuracy.
          </p>
        </div>

        {/* ── Bottom Bar ────────────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid #161616', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ color: '#333', fontSize: '12px', margin: 0 }}>
            © {YEAR} ListingBooth.com — A <strong style={{ color: '#555' }}>BOOTHS.AI</strong> Satellite Application.
            <span style={{ color: '#2a2a2a', margin: '0 8px' }}>·</span>
            <strong style={{ color: '#da291c' }}>Brokered by eXp Realty</strong>
          </p>
          <p style={{ color: '#333', fontSize: '12px', margin: 0 }}>
            Data © {YEAR} CREA · DDF® · MLS® · REALTOR®
          </p>
        </div>
      </div>
    </footer>
  );
}
