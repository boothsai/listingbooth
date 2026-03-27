export const runtime = 'edge';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard/DashboardShell';

export const metadata: Metadata = {
  title: 'My Dashboard | ListingBooth',
  description: 'Your personal home search command center — saved searches, collections, and transaction tracking.',
  robots: { index: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/agent/login');
  }

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', color: '#111' }}>
      <main style={{ padding: '120px 48px 48px', maxWidth: '1400px', margin: '0 auto' }}>
        <DashboardShell userEmail={user.email ?? ''}>
          {children}
        </DashboardShell>
      </main>
    </div>
  );
}
