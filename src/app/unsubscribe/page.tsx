import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unsubscribe | ListingBooth',
  description: 'Manage your email preferences for ListingBooth notifications.',
  robots: { index: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#fafafa', paddingTop: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>📬</div>
        <h1 style={{ margin: '0 0 16px', fontSize: '28px', fontWeight: 900, color: '#111', letterSpacing: '-1px' }}>
          Email Preferences
        </h1>
        <p style={{ margin: '0 0 32px', fontSize: '15px', color: '#666', lineHeight: 1.6 }}>
          {email
            ? `We'll remove ${email} from our mailing list. You can always re-subscribe by signing in again.`
            : 'Manage your email preferences for ListingBooth market alerts and property updates.'
          }
        </p>

        <div style={{
          background: 'white', borderRadius: '16px', padding: '32px',
          border: '1.5px solid #e5e5e5', boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          marginBottom: '24px',
        }}>
          <form method="POST" action="/api/email/unsubscribe">
            <input type="hidden" name="email" value={email || ''} />

            {!email && (
              <input
                name="email"
                type="email"
                required
                placeholder="Enter your email address"
                style={{
                  width: '100%', padding: '14px 16px', border: '1.5px solid #e5e5e5',
                  borderRadius: '10px', fontSize: '15px', fontWeight: 500,
                  marginBottom: '16px', boxSizing: 'border-box', outline: 'none',
                }}
              />
            )}

            <button type="submit" style={{
              width: '100%', padding: '14px', background: '#111', color: 'white',
              border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 800,
              cursor: 'pointer', transition: 'background 0.2s',
            }}>
              Unsubscribe from All Emails
            </button>
          </form>
        </div>

        <p style={{ margin: 0, fontSize: '12px', color: '#aaa', lineHeight: 1.5 }}>
          eXp Realty Brokerage · Powered by ListingBooth · 
          <a href="/" style={{ color: '#da291c', textDecoration: 'none' }}>Return to Portal</a>
        </p>
      </div>
    </main>
  );
}
