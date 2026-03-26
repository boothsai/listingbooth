'use client';

import { useState, useMemo } from 'react';

interface Lead { id: string; name: string; email: string; phone?: string; lead_score: string; intent: string; created_at: string; status: string; }
interface Showing { id: string; user_id: string; listing_key: string; requested_date: string; status: string; created_at: string; listing?: any; }
interface Message { id: string; session_id: string; channel: string; user_name: string; user_role: string; content: string; avatar: string; created_at: string; }

interface TriPaneProps {
  leads: Lead[];
  showings: Showing[];
  messages: Message[];
}

export default function TriPaneCRM({ leads, showings, messages }: TriPaneProps) {
  // Unify contacts based on session_id or email
  // For demonstration, we treat each distinct user interaction session as a "Contact"
  
  const contacts = useMemo(() => {
    // 1. Convert Leads to Contacts
    const cMap = new Map<string, any>();
    
    leads.forEach(l => {
      cMap.set(l.email, {
        id: l.id,
        type: 'Lead',
        name: l.name,
        email: l.email,
        phone: l.phone || 'Unknown',
        timestamp: new Date(l.created_at).getTime(),
        lastActive: new Date(l.created_at).toLocaleDateString(),
        score: l.lead_score,
        intent: l.intent,
        details: l,
        messages: [],
        showings: []
      });
    });

    // 2. Attach Showings (MVP matching by ID or pseudo mapping)
    showings.forEach(s => {
      // In a real DB, user_id matches auth.users.email. Here we mock attach or create standalone.
      const contactId = s.id; // Treat showing as standalone for MVP if no email
      cMap.set(contactId, {
        id: s.id,
        type: 'Showing Request',
        name: s.listing?.street_address || s.listing_key,
        email: 'Authenticated User',
        phone: 'Unknown',
        timestamp: new Date(s.requested_date).getTime(),
        lastActive: new Date(s.requested_date).toLocaleDateString(),
        score: s.status === 'Pending' ? 'Hot' : 'Warm',
        intent: 'Touring',
        details: s,
        messages: [],
        showings: [s]
      });
    });

    // 3. Attach AI Transcripts
    // Transcripts are grouped by session_id. 
    const sessions = new Map<string, any[]>();
    messages.forEach(m => {
      const sId = m.session_id || 'Anonymous AI Session';
      if (!sessions.has(sId)) sessions.set(sId, []);
      sessions.get(sId)!.push(m);
    });

    sessions.forEach((msgs, sId) => {
      cMap.set(sId, {
        id: sId,
        type: 'AI Transcript',
        name: `Concierge Chat: ${sId.substring(0,8)}`,
        email: 'Anonymous Lead',
        phone: 'Uncaptured',
        timestamp: new Date(msgs[0].created_at).getTime(),
        lastActive: new Date(msgs[0].created_at).toLocaleDateString(),
        score: 'Detecting...',
        intent: 'Browsing',
        details: null,
        messages: msgs.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
        showings: []
      });
    });

    return Array.from(cMap.values()).sort((a, b) => b.timestamp - a.timestamp);
  }, [leads, showings, messages]);

  const [activeId, setActiveId] = useState<string | null>(contacts.length > 0 ? contacts[0].id : null);

  const activeContact = useMemo(() => contacts.find(c => c.id === activeId), [activeId, contacts]);

  if (contacts.length === 0) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px dashed #ccc', boxShadow: '0 8px 32px rgba(0,0,0,0.02)' }}>
         <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
         <h3 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 900, color: '#111' }}>Your Inbox is Empty.</h3>
         <p style={{ margin: 0, fontSize: '16px', color: '#666' }}>When users interact with the Concierge or request valuations, they will appear here.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 350px) minmax(400px, 1fr) 320px', gap: '2px', background: 'rgba(0,0,0,0.05)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden', height: 'calc(100vh - 180px)' }}>
      
      {/* 1. LEFT PANE - SMART INBOX */}
      <div style={{ background: '#fafafa', overflowY: 'auto' }}>
        <div style={{ position: 'sticky', top: 0, background: 'rgba(250,250,250,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '16px 20px', zIndex: 10 }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#111' }}>Smart Inbox</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {contacts.map(c => {
            const isActive = c.id === activeId;
            return (
              <div 
                key={c.id} 
                onClick={() => setActiveId(c.id)}
                style={{ 
                  padding: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'background 0.2s',
                  background: isActive ? 'white' : 'transparent',
                  borderLeft: isActive ? '4px solid #da291c' : '4px solid transparent'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '15px', fontWeight: isActive ? 900 : 700, color: '#111' }}>{c.name}</span>
                  <span style={{ fontSize: '12px', color: '#888', fontWeight: 600 }}>{c.lastActive}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#666', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                    {c.type}
                  </span>
                  {c.score === 'Hot' && <span style={{ width: '8px', height: '8px', background: '#da291c', borderRadius: '50%', boxShadow: '0 0 8px rgba(218,41,28,0.4)' }} />}
                  {c.score === 'Warm' && <span style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '50%' }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CENTER PANE - CONVERSATION LOOP */}
      <div style={{ background: 'white', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 900, letterSpacing: '-0.02em', color: '#111' }}>{activeContact?.name}</h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#888', fontWeight: 600 }}>Unified Communication Thread</p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.04)', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#555' }}>
            {activeContact?.type}
          </div>
        </div>

        <div style={{ flex: 1, padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {activeContact?.messages.length > 0 ? (
            activeContact.messages.map((m: any) => {
              const isBot = m.role === 'assistant' || m.user_role === 'system';
              return (
                <div key={m.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexDirection: isBot ? 'row' : 'row-reverse' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, background: isBot ? '#da291c' : '#eaeaea', color: isBot ? 'white' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                    {m.avatar || (isBot ? '🛎️' : '👤')}
                  </div>
                  <div style={{ background: isBot ? '#f9f9f9' : '#111', border: '1px solid rgba(0,0,0,0.06)', padding: '16px 20px', borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px', color: isBot ? '#111' : 'white', fontSize: '15px', lineHeight: 1.6, maxWidth: '85%' }}>
                    {m.content}
                  </div>
                </div>
              );
            })
          ) : (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa' }}>
               <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</div>
               <p style={{ margin: 0, fontWeight: 600 }}>No chat transcript available for this record.</p>
             </div>
          )}
        </div>

        {/* Fake Input for UI MVP */}
        <div style={{ padding: '24px 32px', borderTop: '1px solid rgba(0,0,0,0.08)', background: '#fafafa' }}>
           <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '12px 16px', display: 'flex', gap: '12px' }}>
             <input type="text" disabled placeholder="Reply via SMS or Email (Requires Telephony Connect)..." style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--font-inter)', color: '#888' }} />
             <button disabled style={{ background: '#da291c', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 24px', fontWeight: 800, cursor: 'not-allowed', opacity: 0.5 }}>Send</button>
           </div>
        </div>
      </div>

      {/* 3. RIGHT PANE - DETAILS & ACTION */}
      <div style={{ background: '#fcfcfc', padding: '32px', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 24px', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#111', borderBottom: '2px solid rgba(0,0,0,0.06)', paddingBottom: '12px' }}>Profile Intelligence</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#888', fontWeight: 800, textTransform: 'uppercase' }}>Email Address</p>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111' }}>{activeContact?.email}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#888', fontWeight: 800, textTransform: 'uppercase' }}>Phone</p>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111' }}>{activeContact?.phone}</p>
          </div>
          
          <div style={{ background: 'rgba(218,41,28,0.04)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(218,41,28,0.1)' }}>
            <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#da291c', fontWeight: 900, textTransform: 'uppercase' }}>System Intent</p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#111' }}>{activeContact?.intent}</p>
          </div>

          {activeContact?.showings.length > 0 && (
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }}>
              <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#888', fontWeight: 800, textTransform: 'uppercase' }}>Pending Showing</p>
              <p style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 800, color: '#111' }}>{activeContact.showings[0].listing?.street_address || activeContact.showings[0].listing_key}</p>
              
              {activeContact.showings[0].status === 'Pending' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                   <form action={`/api/tours/action`} method="POST" style={{ flex: 1 }}>
                     <input type="hidden" name="tourId" value={activeContact.showings[0].id} />
                     <input type="hidden" name="status" value="Confirmed" />
                     <button type="submit" style={{ width: '100%', background: '#22c55e', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>Approve</button>
                   </form>
                   <form action={`/api/tours/action`} method="POST" style={{ flex: 1 }}>
                     <input type="hidden" name="tourId" value={activeContact.showings[0].id} />
                     <input type="hidden" name="status" value="Cancelled" />
                     <button type="submit" style={{ width: '100%', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '10px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>Deny</button>
                   </form>
                </div>
              ) : (
                <div style={{ padding: '8px', background: activeContact.showings[0].status === 'Confirmed' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: activeContact.showings[0].status === 'Confirmed' ? '#22c55e' : '#ef4444', textAlign: 'center', borderRadius: '6px', fontWeight: 800 }}>
                  {activeContact.showings[0].status.toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
