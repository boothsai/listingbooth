'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { label: 'Home', href: '/dashboard', icon: '🏠' },
  { label: 'Saved Searches', href: '/dashboard/saved-searches', icon: '🔍' },
  { label: 'Collections', href: '/dashboard/collections', icon: '📁' },
  { label: 'My Journey', href: '/dashboard/journey', icon: '🗺️' },
];

export default function DashboardShell({ userEmail, children }: { userEmail: string; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {/* Welcome header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#888' }}>
          Welcome back
        </p>
        <h1 style={{ margin: '0 0 24px', fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', color: '#111' }}>
          My Dashboard
        </h1>

        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: '4px', padding: '4px',
          background: 'white', borderRadius: '14px',
          border: '1.5px solid #eee', width: 'fit-content',
        }}>
          {TABS.map(tab => {
            const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href));
            const isHomeActive = tab.href === '/dashboard' && pathname === '/dashboard';
            const active = isActive || isHomeActive;
            return (
              <Link key={tab.href} href={tab.href} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '10px',
                background: active ? '#111' : 'transparent',
                color: active ? 'white' : '#666',
                fontSize: '14px', fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: '16px' }}>{tab.icon}</span>
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {children}
    </>
  );
}
