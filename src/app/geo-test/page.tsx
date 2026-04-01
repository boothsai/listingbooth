'use client';

import NeighbourhoodIntelligence from '@/components/NeighbourhoodIntelligence';

/**
 * Standalone test page for the GeoIntelligence Engine.
 * Shows the full 9-tab Neighbourhood Intelligence panel
 * for downtown Ottawa (Parliament Hill area).
 * 
 * URL: /geo-test
 */
export default function GeoTestPage() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      padding: '0 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#111', margin: '0 0 8px' }}>
          🧪 GeoIntelligence Engine — Live Test
        </h1>
        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
          Showing spatial data for <strong>Downtown Ottawa</strong> (45.4215, -75.6972) — Parliament Hill area.
          This panel appears on every listing detail page.
        </p>
      </div>

      <NeighbourhoodIntelligence lat={45.4215} lng={-75.6972} city="Ottawa" />

      <div style={{
        marginTop: '24px', padding: '16px', background: '#f8fafc',
        borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#555'
      }}>
        <strong>ℹ️ Note:</strong> The 3 PRO-gated tabs (Dev Apps, Crime, Permits) require authentication.
        Without logging in, they show the paywall overlay. On a real listing page, this panel
        appears below the property photos and price details.
      </div>
    </div>
  );
}
