'use client';

import { usePathname } from 'next/navigation';

export default function SiteFooter() {
  const pathname = usePathname();
  
  // The Login Portal has no footer
  if (pathname === '/agent/login') return null;

  return (
    <footer style={{
      backgroundColor: '#0f1115',
      color: '#888',
      padding: '24px 48px',
      borderTop: '1px solid #222',
      textAlign: 'center',
      fontSize: '12px'
    }}>
      <p style={{ margin: 0 }}>
        © {new Date().getFullYear()} <strong>ListingBooth Enterprise CRM</strong>. All Rights Reserved. Brokered by <strong style={{ color: '#da291c' }}>eXp Realty Canada</strong>.
      </p>
    </footer>
  );
}
