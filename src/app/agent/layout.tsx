export const runtime = 'edge'
import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LeadToast from '@/components/LeadToast';

export const metadata: Metadata = {
  title: 'Agent CRM | ListingBooth',
  description: 'Enterprise Real Estate Command Center.',
};

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // Route Protection: If not logged in, boot to home
  if (error || !user) {
    redirect('/');
  }

  // Role-Based Access Control (RBAC): ONLY user_metadata.role === 'agent' or 'admin'
  const role = user.user_metadata?.role;
  /*
  if (role !== 'agent' && role !== 'admin') {
    // If they are a normal user attempting to login during the private beta, show unauthorized
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', color: 'white' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>Unauthorized</h1>
          <p style={{ color: '#888', lineHeight: 1.6 }}>Your account has not been provisioned for the Agent Portal. Please contact your brokerage administrator to request access.</p>
        </div>
      </div>
    );
  }
  */

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#111' }}>
      <LeadToast />
      {/* Main CRM Engine - Takes full width now since NavHeader is global */}
      <main style={{ flex: 1, padding: '120px 48px 48px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {children}
        </div>
      </main>

    </div>
  );
}
