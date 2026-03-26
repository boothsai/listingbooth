export const runtime = 'edge'
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AgentToursPage() {
  const supabase = await createClient();
  
  // Extract all tour requests from buyers
  const { data: tours } = await supabase
    .from('user_showings')
    .select('id, user_id, listing_key, requested_date, status, created_at')
    .order('requested_date', { ascending: false });

  const allTours = tours || [];
  
  // Manual join to properties
  const keys = allTours.map((t: any) => t.listing_key);
  let listings: any[] = [];
  if (keys.length > 0) {
    const { data } = await supabase.from('listings').select('listing_key, street_address, city, list_price').in('listing_key', keys);
    listings = data || [];
  }

  // Get user profile data (Assuming we can read user_metadata from auth users, or we just show the ID)
  // In a real edge environment we would query a public `profiles` table. For MVP we use the showing data.

  const enrichedTours = allTours.map((t: any) => {
    const l = listings.find(lst => lst.listing_key === t.listing_key);
    return { ...t, listing: l };
  });

  // Server Action to Approve / Deny
  async function updateTourStatus(formData: FormData) {
    'use server';
    const serverClient = await createClient();
    const tourId = formData.get('tourId') as string;
    const newStatus = formData.get('status') as string;
    
    await serverClient.from('user_showings').update({ status: newStatus }).eq('id', tourId);
    revalidatePath('/agent/tours');
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '40px' }}>
         <h1 style={{ margin: '0 0 8px', fontSize: '32px', fontWeight: 900, letterSpacing: '-1px' }}>
          Showing Requests
        </h1>
        <p style={{ margin: 0, fontSize: '16px', color: '#888' }}>
          Evaluate, confirm, or decline property tour requests from authenticated clients.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {enrichedTours.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px dashed #ccc', boxShadow: '0 8px 32px rgba(0,0,0,0.02)' }}>
            <p style={{ margin: 0, fontSize: '16px', color: '#666', fontWeight: 600 }}>Your inbox is at zero. No requested property showings.</p>
          </div>
        ) : enrichedTours.map((t: any) => (
          <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                {t.status === 'Pending' && <span style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '50%', boxShadow: '0 0 8px rgba(245,158,11,0.5)' }} />}
                <p style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#111' }}>
                  {t.listing?.street_address || t.listing_key}
                </p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#666', fontWeight: 600 }}>
                <span>{t.listing?.city}</span>
                <span>•</span>
                <span style={{ color: '#da291c' }}>${Number(t.listing?.list_price || 0).toLocaleString()}</span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(0,0,0,0.04)', borderRadius: '6px', color: '#111' }}>
                  🗓️ {new Date(t.requested_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
                <span>•</span>
                <span style={{ color: t.status === 'Confirmed' ? '#22c55e' : t.status === 'Cancelled' ? '#ef4444' : '#f59e0b' }}>
                  {t.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', opacity: t.status !== 'Pending' ? 0.3 : 1, pointerEvents: t.status !== 'Pending' ? 'none' : 'auto' }}>
              <form action={updateTourStatus}>
                <input type="hidden" name="tourId" value={t.id} />
                <input type="hidden" name="status" value="Cancelled" />
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', background: 'transparent', border: '1px solid #dc2626', color: '#ef4444', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>
                  Decline
                </button>
              </form>
              <form action={updateTourStatus}>
                <input type="hidden" name="tourId" value={t.id} />
                <input type="hidden" name="status" value="Confirmed" />
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', background: '#22c55e', border: 'none', color: '#111', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}>
                  Confirm Tour
                </button>
              </form>
            </div>

          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
