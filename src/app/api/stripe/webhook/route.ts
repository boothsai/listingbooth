export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Edge-compatible Stripe webhook signature verification using Web Crypto API
async function verifyStripeSignature(body: string, signature: string, secret: string): Promise<boolean> {
  try {
    const parts = signature.split(',');
    const timestampPart = parts.find(p => p.startsWith('t='));
    const v1Part = parts.find(p => p.startsWith('v1='));
    
    if (!timestampPart || !v1Part) return false;
    
    const timestamp = timestampPart.slice(2);
    const expectedSig = v1Part.slice(3);
    
    const signedPayload = `${timestamp}.${body}`;
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(signedPayload);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const computedSig = Array.from(new Uint8Array(sigBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return computedSig === expectedSig;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_placeholder';

  try {
    const isValid = await verifyStripeSignature(body, signature, webhookSecret);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!,
      { cookies: { getAll() { return []; }, setAll() {} } }
    );

    switch (event.type) {
      case 'checkout.session.completed':
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const session = event.data.object as any;
        const userId = session.client_reference_id;
        const customerId = session.customer;

        if (userId) {
          await supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
              stripe_customer_id: customerId,
              subscription_status: 'active'
            }
          });
          console.log(`Updated user ${userId} to active subscription.`);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        console.log('Subscription canceled:', event.data.object);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 500 });
  }
}
