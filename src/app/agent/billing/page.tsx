export const runtime = 'edge'
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SubscriptionButton from './SubscriptionButton';

export const metadata = { title: 'Billing | ListingBooth CRM' };
export const dynamic = 'force-dynamic';

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ success?: string, canceled?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { success, canceled } = await searchParams;
  const isPremium = user.user_metadata?.subscription_status === 'active';

  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <p style={{ margin: '0 0 8px', color: '#10b981', fontWeight: 800, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Account Settings</p>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 900, letterSpacing: '-1px' }}>Subscription & Billing</h1>
      </div>

      {success && (
        <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '32px', fontWeight: 700 }}>
          🎉 Payment successful! You are now a Premium Arsenal Agent.
        </div>
      )}
      
      {canceled && (
        <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '32px', fontWeight: 700 }}>
          Payment was cancelled. You can try again whenever you're ready.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '48px', alignItems: 'start' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Current Plan</h2>
          
          <div style={{ background: '#1a1c23', border: isPremium ? '2px solid #10b981' : '1px solid #2a2d36', padding: '32px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
            
            {isPremium && (
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 800, border: '1px solid rgba(16,185,129,0.2)' }}>
                ACTIVE
              </div>
            )}

            <h3 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 900, color: 'white' }}>
              {isPremium ? 'Premium Arsenal' : 'Basic Agent Tier'}
            </h3>
            
            <p style={{ margin: '0 0 24px', color: '#888', fontSize: '15px', lineHeight: 1.6 }}>
              {isPremium 
                ? 'You have unlocking full access to Magic Links, the AI Valuation Funnel, and the Real-time Notification System.' 
                : 'You currently have restricted access. Upgrade to unlock Magic Links, AI Recommendations, and the AI Valuation Funnel.'}
            </p>

            <div style={{ fontSize: '32px', fontWeight: 900, color: 'white', marginBottom: '32px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              {isPremium ? '$49' : '$0'}
              <span style={{ fontSize: '15px', color: '#666', fontWeight: 600, paddingBottom: '6px' }}>/mo</span>
            </div>

            {!isPremium && <SubscriptionButton />}
            
            {isPremium && (
              <button disabled style={{ padding: '16px', width: '100%', background: '#2a2d36', color: '#888', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'not-allowed' }}>
                Manage Subscription (Coming Soon)
              </button>
            )}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Premium Features
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', fontWeight: 600 }}>
              <span style={{ color: '#10b981' }}>✓</span> Unlimited Magic Links
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', fontWeight: 600 }}>
              <span style={{ color: '#10b981' }}>✓</span> Real-Time Toast Notifications
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', fontWeight: 600 }}>
              <span style={{ color: '#10b981' }}>✓</span> Automated Email & SMS Sequences
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
