export const runtime = 'edge'
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import InviteAgentButton from '@/components/InviteAgentButton';

export const metadata = { title: 'Admin Command Center | ListingBooth' };
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Strict RBAC: Only 'admin' role can enter
  if (!user || user.user_metadata?.role !== 'admin') {
    redirect('/agent');
  }

  // Use Service Role to fetch all registered users
  // (Standard Next.js Server Components run securely on the server)
  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!,
    { cookies: { getAll() { return []; } } }
  );

  const { data: { users }, error } = await adminSupabase.auth.admin.listUsers();
  
  const consumers = users?.filter(u => u.user_metadata?.role !== 'admin') || [];
  const activeAdmins = users?.filter(u => u.user_metadata?.role === 'admin') || [];

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0f1115', color: 'white' }}>
      <div style={{ padding: '80px 48px', maxWidth: '1400px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(218, 41, 28, 0.1)', color: '#da291c', borderRadius: '100px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '16px' }}>
              BROKERAGE OVERSEER
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-1px' }}>Admin Command Center</h1>
            <p style={{ color: '#888', fontSize: '16px' }}>Monitor platform traffic, B2C telemetry, and global user registration.</p>
          </div>
          
          <InviteAgentButton />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '48px' }}>
          <div style={{ backgroundColor: '#181b21', border: '1px solid #2a2e37', padding: '24px', borderRadius: '16px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Registered Consumers</p>
            <p style={{ margin: 0, fontSize: '36px', fontWeight: 900, color: 'white' }}>{consumers.length}</p>
          </div>
          <div style={{ backgroundColor: '#181b21', border: '1px solid #2a2e37', padding: '24px', borderRadius: '16px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Admins</p>
            <p style={{ margin: 0, fontSize: '36px', fontWeight: 900, color: '#f59e0b' }}>{activeAdmins.length}</p>
          </div>
          <div style={{ backgroundColor: '#181b21', border: '1px solid #2a2e37', padding: '24px', borderRadius: '16px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Status</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#22c55e' }}>Fully Operational</p>
          </div>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', borderBottom: '1px solid #2a2e37', paddingBottom: '16px' }}>
          Consumer Database
        </h2>

        <div style={{ backgroundColor: '#181b21', border: '1px solid #2a2e37', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#1c1f26', borderBottom: '1px solid #2a2e37' }}>
                <th style={{ padding: '16px 24px', fontSize: '11px', color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consumer Name</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registration</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {consumers.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #2a2e37' }}>
                  <td style={{ padding: '20px 24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2b303b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', border: '1px solid #3c4250' }}>
                      {a.email?.charAt(0).toUpperCase()}
                    </div>
                    {a.user_metadata?.full_name || 'Consumer'}
                  </td>
                  <td style={{ padding: '20px 24px', color: '#ccc', fontSize: '14px' }}>{a.email}</td>
                  <td style={{ padding: '20px 24px', color: '#888', fontSize: '13px' }}>
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <button style={{ backgroundColor: 'transparent', color: '#888', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Delete Record</button>
                  </td>
                </tr>
              ))}
              
              {/* Cleaned the pending Agent Approval section as Agents are fully deprecated */}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}
