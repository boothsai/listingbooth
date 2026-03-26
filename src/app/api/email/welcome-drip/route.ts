export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, firstName, agentId, token } = await req.json();

    if (!email || !agentId) {
      return NextResponse.json({ error: 'email and agentId required' }, { status: 400 });
    }

    // Step 1: Look up agent details
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!,
      { cookies: { getAll() { return cookieStore.getAll(); } } }
    );

    const { data: { user: agent } } = await supabase.auth.admin.getUserById(agentId);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const agentName = agent.user_metadata?.full_name || 'Your Agent';
    const agentEmail = agent.email || 'support@listingbooth.com';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://listingbooth.com';

    // Step 2: Build beautifully branded HTML payload
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; background-color: #fafafa; color: #111;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #eee;">
          <div style="background-color: #111; padding: 32px 40px; text-align: center;">
            <p style="margin: 0; color: white; font-size: 24px; font-weight: 900; letter-spacing: -1px;">
              listing<span style="color: #da291c;">booth</span>
            </p>
          </div>
          <div style="padding: 40px;">
            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Welcome to your curated portal, ${firstName ? firstName : 'VIP'}!</h1>
            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #555;">
              I'm thrilled you've joined my private real estate network. As a member, you now have unrestricted access to premium property insights, AI-powered neighborhood analysis, and the true cost of ownership breakdowns.
            </p>
            <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #555;">
              Whenever you're ready, we can schedule a private tour of any properties on the portal. No pressure, just luxury service whenever you need it.
            </p>
            <div style="text-align: center;">
              <a href="${siteUrl}/share/${token || ''}" style="display: inline-block; padding: 16px 32px; background-color: #da291c; color: white; text-decoration: none; font-weight: 800; border-radius: 12px; font-size: 16px; box-shadow: 0 4px 14px rgba(218,41,28,0.3);">
                Return to Portal
              </a>
            </div>
          </div>
          <div style="background-color: #f9f9f9; padding: 24px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; font-size: 14px; font-weight: 700; color: #111;">${agentName}</p>
            <p style="margin: 4px 0 0; font-size: 12px; font-weight: 600; color: #888;">eXp Realty Brokerage</p>
            <p style="margin: 8px 0 0; font-size: 11px; color: #aaa;">This is an automated message requested by your agent.</p>
          </div>
        </div>
      </div>
    `;

    // Step 3: Send via Resend HTTP API (Edge-compatible fetch — no SDK dependency)
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY || 're_test_placeholder'}`,
      },
      body: JSON.stringify({
        from: 'ListingBooth VIP <hello@listingbooth.com>',
        reply_to: agentEmail,
        to: [email],
        subject: `Welcome to your private property portal 🏡`,
        html: htmlBody,
        tags: [
          { name: 'campaign', value: 'welcome_drip_1' },
          { name: 'agent_id', value: agentId }
        ]
      }),
    });

    if (!resendResponse.ok) {
      const errData = await resendResponse.json();
      console.error('Resend Error:', errData);
      return NextResponse.json({ error: 'Email delivery failed' }, { status: 500 });
    }

    const data = await resendResponse.json();
    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error('Email API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
