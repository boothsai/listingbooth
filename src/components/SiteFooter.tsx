'use client';

import Link from 'next/link';

const QUICK_LINKS = [
  { label: 'Buy', href: '/buy' },
  { label: 'Sell', href: '/sell' },
  { label: 'Map Search', href: '/map-search' },
  { label: 'Market Trends', href: '/market-report' },
  { label: 'Tools', href: '/tools' },
  { label: 'Platform', href: '/platform' },
];

const CITIES = [
  { label: 'Toronto', href: '/buy?city=Toronto' },
  { label: 'Ottawa', href: '/buy?city=Ottawa' },
  { label: 'Mississauga', href: '/buy?city=Mississauga' },
  { label: 'Oakville', href: '/buy?city=Oakville' },
  { label: 'Vaughan', href: '/buy?city=Vaughan' },
  { label: 'Hamilton', href: '/buy?city=Hamilton' },
  { label: 'London', href: '/buy?city=London' },
  { label: 'Barrie', href: '/buy?city=Barrie' },
];

const COMPANY = [
  { label: 'About', href: '/platform' },
  { label: 'Agent Login', href: '/agent/login' },
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Terms of Use', href: '/legal/terms' },
];

export default function SiteFooter() {
  return (
    <footer style={{ backgroundColor: '#0a0a0a', padding: '64px 24px 0', borderTop: '4px solid #da291c' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Main columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px', marginBottom: '48px' }}>
          
          {/* Brand column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-transparent.png" alt="ListingBooth" style={{ height: '40px', width: 'auto' }} />
              <span style={{ fontSize: '20px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
                Listing<span style={{ color: '#da291c' }}>Booth</span>.com
              </span>
            </div>
            <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#888', lineHeight: 1.6, maxWidth: '280px' }}>
              Canada&apos;s AI-first real estate portal. Real-time MLS® data, AI valuations, and full market transparency — all for free.
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>
              Brokered by <strong style={{ color: '#da291c' }}>eXp Realty Canada</strong>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ margin: '0 0 20px', fontSize: '13px', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Quick Links
            </h4>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {QUICK_LINKS.map(link => (
                <li key={link.label} style={{ marginBottom: '10px' }}>
                  <Link href={link.href} style={{ color: '#ccc', fontSize: '14px', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#da291c')}
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#ccc')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Cities */}
          <div>
            <h4 style={{ margin: '0 0 20px', fontSize: '13px', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Popular Cities
            </h4>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {CITIES.map(city => (
                <li key={city.label} style={{ marginBottom: '10px' }}>
                  <Link href={city.href} style={{ color: '#ccc', fontSize: '14px', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#da291c')}
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#ccc')}
                  >
                    {city.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 style={{ margin: '0 0 20px', fontSize: '13px', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Company
            </h4>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {COMPANY.map(item => (
                <li key={item.label} style={{ marginBottom: '10px' }}>
                  <Link href={item.href} style={{ color: '#ccc', fontSize: '14px', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#da291c')}
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = '#ccc')}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '24px 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#555', lineHeight: 1.6 }}>
            © {new Date().getFullYear()} <strong style={{ color: '#888' }}>ListingBooth.com</strong>. All Rights Reserved.
            Brokered by <strong style={{ color: '#da291c' }}>eXp Realty Canada</strong>.
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: '#444', lineHeight: 1.6, maxWidth: '500px', textAlign: 'right' }}>
            The listing data is provided under copyright by the Canadian Real Estate Association (CREA). The information is deemed reliable but not guaranteed. Data sourced from the CREA DDF® feed.
          </p>
        </div>
      </div>
    </footer>
  );
}
