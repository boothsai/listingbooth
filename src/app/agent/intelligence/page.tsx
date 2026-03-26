export const runtime = 'edge'
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function IntelligenceHubPage() {
  const supabase = await createClient();
  
  // Extract top 100 recent Unity Messages to construct transcripts
  const { data: messages } = await supabase
    .from('unity_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  const allMessages: any[] = messages || [];

  // Group by session_id
  const sessions: Record<string, any[]> = {};
  allMessages.forEach(m => {
    const sId = m.session_id || 'Anonymous Session';
    if (!sessions[sId]) sessions[sId] = [];
    sessions[sId].push(m);
  });

  // Sort sessions by most recent message
  const sortedSessions = Object.entries(sessions)
    .sort(([, msgsA], [, msgsB]) => new Date(msgsB[0].created_at).getTime() - new Date(msgsA[0].created_at).getTime());

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '32px', alignItems: 'start' }}>
      
      {/* Transcripts Window */}
      <div>
        <div style={{ marginBottom: '40px' }}>
           <h1 style={{ margin: '0 0 8px', fontSize: '32px', fontWeight: 900, letterSpacing: '-1px' }}>
            VABOT Intelligence Hub
          </h1>
          <p style={{ margin: 0, fontSize: '16px', color: '#888' }}>
            Unfiltered visibility into VABOT interactions. Review buyer concerns, objections, and showing requests before your first call.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {sortedSessions.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px dashed #ccc', boxShadow: '0 12px 32px rgba(0,0,0,0.02)' }}>
               <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
               <h3 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 900, color: '#111' }}>No Active VABOT Transcripts.</h3>
               <p style={{ margin: 0, fontSize: '16px', color: '#666' }}>When users interact with VABOT in the bottom-right corner, their raw chat logs will appear here for you to analyze.</p>
            </div>
          ) : sortedSessions.map(([sessionId, msgs]) => {
            // Sort messages chronologically for this session
            const chronoMsgs = [...msgs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            
            return (
              <div key={sessionId} style={{ background: 'white', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
                <div style={{ background: 'rgba(0,0,0,0.02)', padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Session: {sessionId.substring(0, 8)}...</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#888', fontWeight: 600 }}>{new Date(chronoMsgs[chronoMsgs.length - 1].created_at).toLocaleString()}</p>
                </div>
                
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {chronoMsgs.map((m: any) => {
                    const isBot = m.role === 'assistant';
                    return (
                      <div key={m.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexDirection: isBot ? 'row' : 'row-reverse' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, background: isBot ? '#da291c' : '#e5e5e5', color: isBot ? 'white' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>
                          {isBot ? 'V' : 'U'}
                        </div>
                        <div style={{ background: isBot ? '#f9f9f9' : '#111', border: `1px solid rgba(0,0,0,0.06)`, padding: '12px 16px', borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px', color: isBot ? '#111' : 'white', fontSize: '14px', lineHeight: 1.6, maxWidth: '80%', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                          {m.content}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Panel */}
      <div style={{ position: 'sticky', top: '48px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '32px', border: '1px solid rgba(0,0,0,0.08)', textAlign: 'center', boxShadow: '0 12px 32px rgba(0,0,0,0.03)' }}>
          <div style={{ margin: '0 auto 16px', width: '64px', height: '64px', background: 'rgba(218,41,28,0.1)', color: '#da291c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', boxShadow: '0 0 24px rgba(218,41,28,0.2)' }}>
            🧠
          </div>
          <h2 style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: 900, color: '#111' }}>VABOT AI Engine</h2>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#666', lineHeight: 1.6 }}>
            VABOT handles top-of-funnel inquiries, screens out tire-kickers, and aggressively pushes hot leads to book showings. Read the logs to close deals faster.
          </p>

          <div style={{ textAlign: 'left', background: '#f9f9f9', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#888', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Current System Prompt</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#555', lineHeight: 1.5, fontStyle: 'italic' }}>
              "You are the senior listing assistant for ListingBooth... Overcome objections and force the user to provide their phone number."
            </p>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
