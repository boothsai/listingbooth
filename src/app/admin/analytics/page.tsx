export const runtime = 'edge'
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = {
  title: 'Lead Analytics | ListingBooth Enterprise',
};
export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== 'admin') {
    redirect('/agent');
  }

  // Fetch events grouped by token
  const { data: events } = await supabase
    .from('lead_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100); // simplify for now

  // Process data for UI
  const totalViews = events?.filter(e => e.event_type === 'view').length || 0;
  const totalLeads = events?.filter(e => e.event_type === 'form_submit').length || 0;
  const conversionRate = totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) : '0.0';

  const tokens = Array.from(new Set(events?.map(e => e.token) || []));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <p style={{ margin: '0 0 8px', color: '#da291c', fontWeight: 700, fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Command Center</p>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900, letterSpacing: '-1px' }}>Lead Analytics</h1>
        </div>
        <div>
          <Link href="/admin" style={{ color: '#888', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            ← Back to Overview
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
        <div style={{ background: '#1a1c23', padding: '24px', borderRadius: '16px', border: '1px solid #2a2d36' }}>
          <p style={{ margin: '0 0 8px', color: '#888', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Magic Link Views</p>
          <p style={{ margin: 0, fontSize: '36px', fontWeight: 900, color: 'white' }}>{totalViews}</p>
        </div>
        <div style={{ background: '#1a1c23', padding: '24px', borderRadius: '16px', border: '1px solid #2a2d36' }}>
          <p style={{ margin: '0 0 8px', color: '#888', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Leads Captured</p>
          <p style={{ margin: 0, fontSize: '36px', fontWeight: 900, color: 'white' }}>{totalLeads}</p>
        </div>
        <div style={{ background: '#1a1c23', padding: '24px', borderRadius: '16px', border: '1px solid #2a2d36' }}>
          <p style={{ margin: '0 0 8px', color: '#888', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Network Conversion</p>
          <p style={{ margin: 0, fontSize: '36px', fontWeight: 900, color: '#da291c' }}>{conversionRate}%</p>
        </div>
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Recent Link Activity</h2>
      <div style={{ background: '#1a1c23', borderRadius: '16px', border: '1px solid #2a2d36', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#22252e' }}>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Time</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Event Type</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Token ID</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Platform</th>
            </tr>
          </thead>
          <tbody>
            {events?.map((e) => (
              <tr key={e.id} style={{ borderTop: '1px solid #2a2d36' }}>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: '#ccc' }}>
                  {new Date(e.created_at).toLocaleString()}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '100px', 
                    fontSize: '12px', 
                    fontWeight: 800,
                    background: e.event_type === 'view' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: e.event_type === 'view' ? '#3b82f6' : '#10b981'
                  }}>
                    {e.event_type.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '14px', color: 'white', fontFamily: 'monospace' }}>
                  <Link href={`/share/${e.token}`} target="_blank" style={{ color: '#da291c', textDecoration: 'none' }}>
                    {e.token.slice(0, 12)}...
                  </Link>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '13px', color: '#888' }}>
                  {e.user_agent?.split(' ')[0] || 'Unknown'}
                </td>
              </tr>
            ))}
            {(!events || events.length === 0) && (
              <tr>
                <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#666' }}>No lead events found yet. Share a link to start tracking!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
