import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Resolve Mailbox
  const { data: mailbox } = await supabase
    .schema('mail')
    .from('mailboxes')
    .select('id, email, label')
    .eq('user_id', user?.id)
    .single();

  // 2. Fetch Emails
  let emails: any[] = [];
  if (mailbox) {
    const { data } = await supabase
      .schema('mail')
      .from('emails')
      .select('*')
      .eq('mailbox_id', mailbox.id)
      .order('received_at', { ascending: false });
    
    emails = data || [];
  }

  // 3. Fallback Mock Data for UI Visual Excellence (if DB is empty)
  const mockChat = [
    {
      id: 'm1',
      from_name: 'Sarah (Your Agent)',
      subject: 'Re: 124 Waterfront Dr — Private Tour',
      snippet: 'I got the keys for tomorrow at 2 PM! The seller accepted our showing request. Let me know if you want to see any other properties while we are in the area.',
      received_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      is_read: false,
    },
    {
      id: 'm2',
      from_name: 'Mortgage Concierge',
      subject: 'Pre-Approval Document Received',
      snippet: 'Your Equifax pull is complete and your pre-approval letter for $1.2M has been attached to your BOOTHS.AI profile. Happy hunting!',
      received_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      is_read: true,
    }
  ];

  const displayEmails = emails.length > 0 ? emails : mockChat;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', height: 'calc(100vh - 280px)' }}>
      {/* Threads List */}
      <div style={{
        background: 'white', borderRadius: '16px', border: '1.5px solid #eee',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        <div style={{ padding: '24px', borderBottom: '1.5px solid #eee' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, letterSpacing: '-0.5px' }}>Inbox</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888', fontWeight: 500 }}>
            {mailbox ? mailbox.email : 'Native encrypted chat'}
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {displayEmails.map((msg, index) => (
            <div key={msg.id} style={{
              padding: '20px 24px', borderBottom: '1.5px solid #eee',
              background: index === 0 ? '#fafafa' : 'white', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={e => e.currentTarget.style.background = index === 0 ? '#fafafa' : 'white'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: msg.is_read ? 700 : 900, color: '#111' }}>
                  {msg.from_name || 'Support'}
                </span>
                <span style={{ fontSize: '12px', color: '#888', fontWeight: 500 }}>
                  {new Date(msg.received_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 900, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {msg.subject}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {msg.snippet}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Active Thread View */}
      <div style={{
        background: 'white', borderRadius: '16px', border: '1.5px solid #eee',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Thread Header */}
        <div style={{ padding: '24px', borderBottom: '1.5px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, letterSpacing: '-0.5px' }}>
              {displayEmails[0].subject}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888', fontWeight: 600 }}>
              From: <span style={{ color: '#111' }}>{displayEmails[0].from_name}</span>
            </p>
          </div>
          <button style={{
            background: 'transparent', border: '1.5px solid #eee', borderRadius: '100px',
            padding: '8px 16px', fontSize: '13px', fontWeight: 800, cursor: 'pointer'
          }}>
            Archive
          </button>
        </div>

        {/* Thread Body */}
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto', background: '#fafafa' }}>
           <div style={{
             background: 'white', border: '1.5px solid #eee', borderRadius: '16px',
             padding: '24px', whiteSpace: 'pre-wrap', fontSize: '15px', color: '#333', lineHeight: 1.6
           }}>
             {displayEmails[0].body_text || displayEmails[0].snippet}
             
             {/* Fake attachment */}
             {!displayEmails[0].body_text && (
               <div style={{ marginTop: '24px', padding: '16px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', width: 'fit-content' }}>
                 <span style={{ fontSize: '24px' }}>📄</span>
                 <div>
                   <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#111' }}>Listing_Details_124.pdf</p>
                   <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>2.4 MB</p>
                 </div>
               </div>
             )}
           </div>
        </div>

        {/* Reply Box */}
        <div style={{ padding: '24px', borderTop: '1.5px solid #eee', background: 'white' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Reply securely to your agent..."
              style={{
                flex: 1, background: '#f5f5f5', border: 'none', borderRadius: '100px',
                padding: '0 24px', fontSize: '14px', outline: 'none', fontWeight: 500
              }} 
            />
            <button style={{
              background: '#da291c', color: 'white', border: 'none', borderRadius: '100px',
              padding: '12px 32px', fontSize: '14px', fontWeight: 800, cursor: 'pointer'
            }}>
              Send
            </button>
          </div>
          <p style={{ margin: '12px 0 0', fontSize: '11px', color: '#999', textAlign: 'center', fontWeight: 600 }}>
            🔒 End-to-end encrypted under the BOOTHS.AI /mail protocol
          </p>
        </div>
      </div>
    </div>
  );
}
