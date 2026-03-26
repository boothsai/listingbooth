export const runtime = 'edge'
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SettingsForm from './SettingsForm';

export const metadata = { title: 'Settings | ListingBooth CRM' };
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const alertPhone = user.user_metadata?.alert_phone || '';

  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <p style={{ margin: '0 0 8px', color: '#10b981', fontWeight: 800, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Configuration</p>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900, letterSpacing: '-1px' }}>Agent Settings</h1>
      </div>

      <div style={{ maxWidth: '600px', background: '#1a1c23', border: '1px solid #2a2d36', padding: '32px', borderRadius: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Lead Alert Phone Number</h2>
        <p style={{ margin: '0 0 24px', color: '#888', fontSize: '14px', lineHeight: 1.6 }}>
          Enter your mobile number to receive instant Twilio SMS text messages whenever a client registers on one of your Magic Links.
        </p>

        <SettingsForm initialPhone={alertPhone} />
      </div>
    </div>
  );
}
