export const runtime = 'edge'
import { createClient } from '@/lib/supabase/server';
import TriPaneCRM from '@/components/crm/TriPaneCRM';

export const dynamic = 'force-dynamic';

export default async function AgentPipelinePage() {
  const supabase = await createClient();
  
  // 1. Extract all leads
  const { data: leads } = await supabase.from('leads').select('*').order('created_at', { ascending: false });

  // 2. Extract showings
  const { data: showings } = await supabase.from('user_showings').select('*').order('requested_date', { ascending: false });
  // Manual join to properties MVP
  let enrichedShowings = showings || [];
  if (enrichedShowings.length > 0) {
    const keys = enrichedShowings.map(t => t.listing_key);
    const { data: listings } = await supabase.from('listings').select('listing_key, street_address, city, list_price').in('listing_key', keys);
    enrichedShowings = enrichedShowings.map(t => ({ ...t, listing: (listings||[]).find(l => l.listing_key === t.listing_key) }));
  }

  // 3. Extract Concierge Transcripts
  const { data: messages } = await supabase.from('unity_messages').select('*').order('created_at', { ascending: false }).limit(200);

  // Aggregate stats
  const hotLeads = (leads || []).filter(l => l.lead_score === 'Hot').length;
  const pendingShowings = enrichedShowings.filter(s => s.status === 'Pending').length;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
           <h1 style={{ margin: '0 0 8px', fontSize: '32px', fontWeight: 900, letterSpacing: '-1px' }}>
            Smart Inbox
          </h1>
          <p style={{ margin: 0, fontSize: '15px', color: '#888', fontWeight: 500 }}>
            Unified FUB-architecture CRM mirroring leads, showings, and AI transcripts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 900, color: '#111' }}>{pendingShowings}</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#da291c', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Showings</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 900, color: '#111' }}>{hotLeads}</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#22c55e', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Hot Leads</p>
          </div>
        </div>
      </div>

      <TriPaneCRM leads={leads || []} showings={enrichedShowings} messages={messages || []} />
    </div>
  );
}
