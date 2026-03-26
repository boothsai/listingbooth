export const runtime = 'edge';
/**
 * POST /api/email/drip
 *
 * Multi-touch email drip campaign engine.
 * Sends sequenced follow-up emails based on the day parameter.
 * 
 * POST body: { email: string, firstName?: string, day: 3 | 7 | 14 | 30, agentName?: string, token?: string }
 * 
 * Campaign sequence:
 * - Day 3:  "Here's what's new" — fresh listings matching their activity
 * - Day 7:  "Market snapshot" — price trends, inventory changes
 * - Day 14: "Still looking?" — re-engagement with AI recommendations
 * - Day 30: "Your monthly intel" — comprehensive market report
 */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DRIP_TEMPLATES: Record<number, { subject: string; heading: string; body: string; cta: string; ctaLabel: string }> = {
  3: {
    subject: '🏠 New listings just hit the market',
    heading: 'Fresh Homes You\u2019ll Love',
    body: 'Since you visited, several new properties have appeared in your target area. Our AI has flagged the best matches based on your browsing patterns.',
    cta: '/buy',
    ctaLabel: 'See New Listings',
  },
  7: {
    subject: '📊 Your weekly market snapshot',
    heading: 'This Week in Real Estate',
    body: 'Here\u2019s what changed in your market this week: new inventory, price movements, and how fast homes are selling. Stay informed to time your move perfectly.',
    cta: '/market-report',
    ctaLabel: 'View Market Report',
  },
  14: {
    subject: '🔑 Still searching? We can help',
    heading: 'Let\u2019s Find Your Home Together',
    body: 'Looking for the perfect home takes time, and we\u2019re here to make it easier. Our AI concierge can build a custom search based on exactly what you want \u2014 just tell us your dream features.',
    cta: '/buy',
    ctaLabel: 'Refine My Search',
  },
  30: {
    subject: '📈 Your monthly real estate intelligence briefing',
    heading: 'Monthly Market Intelligence',
    body: 'Your personalized monthly digest is ready. See how prices have shifted, which neighbourhoods are heating up, and where the best value opportunities are right now.',
    cta: '/market-report',
    ctaLabel: 'Read Full Report',
  },
};

export async function POST(req: Request) {
  try {
    const { email, firstName, day, agentName, token } = await req.json();

    if (!email || !day) {
      return NextResponse.json({ error: 'email and day are required' }, { status: 400 });
    }

    const template = DRIP_TEMPLATES[day];
    if (!template) {
      return NextResponse.json({ error: `Invalid day. Valid: ${Object.keys(DRIP_TEMPLATES).join(', ')}` }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://listingbooth.com';
    const agent = agentName || 'ListingBooth Partners';
    const name = firstName || 'there';

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; background-color: #fafafa; color: #111;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #eee;">
          <div style="background-color: #111; padding: 24px 40px; text-align: center;">
            <p style="margin: 0; color: white; font-size: 22px; font-weight: 900; letter-spacing: -1px;">
              listing<span style="color: #da291c;">booth</span>
            </p>
          </div>
          <div style="padding: 40px;">
            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #111;">${template.heading}</h1>
            <p style="margin: 0 0 8px; font-size: 14px; color: '#aaa'; font-weight: 600;">Hey ${name},</p>
            <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.7; color: #555;">
              ${template.body}
            </p>
            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${siteUrl}${token ? `/share/${token}` : template.cta}" style="display: inline-block; padding: 16px 32px; background-color: #da291c; color: white; text-decoration: none; font-weight: 800; border-radius: 12px; font-size: 16px; box-shadow: 0 4px 14px rgba(218,41,28,0.3);">
                ${template.ctaLabel}
              </a>
            </div>
            <p style="margin: 0; font-size: 13px; color: #aaa; line-height: 1.6;">
              You're receiving this because you signed up on ListingBooth. 
              <a href="${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #da291c;">Unsubscribe</a>
            </p>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; font-size: 13px; font-weight: 700; color: #111;">${agent}</p>
            <p style="margin: 4px 0 0; font-size: 11px; font-weight: 600; color: #888;">eXp Realty Brokerage &bull; Powered by ListingBooth AI</p>
          </div>
        </div>
      </div>
    `;

    // Send via Resend API
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'ListingBooth <hello@listingbooth.com>',
        to: [email],
        subject: template.subject,
        html: htmlBody,
        tags: [
          { name: 'campaign', value: `drip_day_${day}` },
          { name: 'sequence', value: 'nurture' },
        ],
      }),
    });

    if (!resendResponse.ok) {
      const errData = await resendResponse.json();
      console.error('[drip] Resend error:', errData);
      return NextResponse.json({ error: 'Email delivery failed' }, { status: 500 });
    }

    const data = await resendResponse.json();
    return NextResponse.json({
      success: true,
      day,
      email_id: data?.id,
      next_drip: day === 3 ? 7 : day === 7 ? 14 : day === 14 ? 30 : null,
    });

  } catch (err: any) {
    console.error('[drip] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
