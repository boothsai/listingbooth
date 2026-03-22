import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use the Service Role key to bypass RLS and insert into core_logic from the server
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Insert the User's message into core_logic.unity_messages
    const { error: userError } = await supabaseAdmin
      .from('unity_messages')
      .insert({
        channel: 'lead-inquiries',
        user_name: 'Website Visitor',
        user_role: 'lead',
        avatar: '👤',
        content: message,
      });

    if (userError) {
      console.error('VABOT User Insert Error:', userError);
      // Even if Supabase fails (e.g. wrong schema mapping), we still want to reply natively
    }

    // 2. Generate an AI response (MVP: Smart Auto-Responder)
    const lowerMsg = message.toLowerCase();
    let reply = "I've logged your request. An expert eXp Realty agent will reach out momentarily to assist you.";

    if (lowerMsg.includes('price') || lowerMsg.includes('worth') || lowerMsg.includes('valuation')) {
      reply = "I can definitely help with pricing! Have you tried our AI Home Valuation tool in the 'Sell' section yet? I can also connect you directly with an agent for a precise CMA.";
    } else if (lowerMsg.includes('showing') || lowerMsg.includes('see') || lowerMsg.includes('tour')) {
      reply = "I can book a showing for you within the hour. Just drop the address of the property or the MLS number here, and I'll notify the listing agent.";
    } else if (lowerMsg.includes('agent') || lowerMsg.includes('realtor') || lowerMsg.includes('broker')) {
      reply = "We have over 3,200 elite eXp Realty agents in our network. Are you looking to buy or sell, and in which city?";
    }

    // 3. Insert VABOT's reply into unity_messages
    await supabaseAdmin
      .from('unity_messages')
      .insert({
        channel: 'lead-inquiries',
        user_name: 'VABOT',
        user_role: 'system',
        avatar: '🤖',
        content: reply,
      });

    // 4. Return the reply to the Next.js frontend
    return NextResponse.json({ reply });

  } catch (error) {
    console.error('VABOT API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
