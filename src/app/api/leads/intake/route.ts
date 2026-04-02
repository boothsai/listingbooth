export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Validations
    if (!payload.firstName || !payload.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Proxy the request to the Central BOOTHS.AI clearinghouse endpoint
    const clearinghouseUrl = process.env.BOOTHS_CRM_CLEARINGHOUSE_URL 
      || 'https://omni-gateway.ali-373.workers.dev/api/leads/intake';
    
    const clearinghouseAuth = process.env.BOOTHS_CRM_API_KEY || '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (clearinghouseAuth) {
      headers['Authorization'] = `Bearer ${clearinghouseAuth}`;
    }

    const response = await fetch(clearinghouseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[leads/intake proxy] Upstream failed:', errText);
      return NextResponse.json({ error: 'Failed to route lead to clearinghouse' }, { status: 502 });
    }

    return NextResponse.json({ success: true, message: 'Lead routed successfully' });

  } catch (err) {
    console.error('[leads/intake proxy] Exception:', err);
    return NextResponse.json({ error: 'Internal proxy error' }, { status: 500 });
  }
}
