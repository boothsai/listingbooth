export const runtime = 'edge'
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Lazy initialization — prevents build-time crash when env vars aren't loaded
let _admin: ReturnType<typeof createClient> | null = null;
function getSupabaseAdmin() {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _admin;
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Insert the User's message into core_logic.unity_messages
    const { error: userError } = await getSupabaseAdmin()
      .from('unity_messages')
      .insert({
        channel: 'lead-inquiries',
        user_name: 'Website Visitor',
        user_role: 'lead',
        avatar: '👤',
        content: message,
      } as any);

    if (userError) {
      console.error('VABOT User Insert Error:', userError);
      // Even if Supabase fails (e.g. wrong schema mapping), we still want to reply natively
    }

    // 2. Generate an AI response (Dream Home AI Matching + Semantic Semantic NLP)
    const lowerMsg = message.toLowerCase();
    let reply = "I've logged your request. A ListingBooth real estate expert will contact you momentarily to assist you.";

    // DREAM HOME AI MATCHING — parse natural language into PSEO search links
    const featureKeywords: Record<string, string> = {
      'pool': 'pool', 'swimming': 'pool', 'hot tub': 'hot-tub',
      'wine cellar': 'wine-cellar', 'wine room': 'wine-cellar',
      'hardwood': 'hardwood-floors', 'hardwood floor': 'hardwood-floors',
      'vaulted ceiling': 'vaulted-ceiling', 'high ceiling': 'vaulted-ceiling',
      'fireplace': 'fireplace', 'garage': 'double-garage',
      'walkout': 'walkout-basement', 'basement walkout': 'walkout-basement',
      'granite': 'granite-counters', 'marble': 'marble-counters',
      'home office': 'home-office', 'office': 'home-office',
      'gym': 'gym', 'sauna': 'sauna', 'solar': 'solar-panels',
    };

    // Detect city
    const cities = ['ottawa', 'toronto', 'vancouver', 'calgary', 'montreal', 'mississauga'];
    let detectedCity = 'ottawa';
    for (const city of cities) {
      if (lowerMsg.includes(city)) { detectedCity = city; break; }
    }

    // Detect features from natural language
    const detectedFeatures: string[] = [];
    for (const [keyword, slug] of Object.entries(featureKeywords)) {
      if (lowerMsg.includes(keyword)) detectedFeatures.push(slug);
    }

    if (detectedFeatures.length > 0) {
      const featureSlug = detectedFeatures[0]; // Use primary feature for the PSEO link
      const searchUrl = `/${detectedCity}/${featureSlug}`;
      reply = `Great taste! I found properties matching your criteria. Here's a curated search for **${featureSlug.replace(/-/g, ' ')}** homes in **${detectedCity.charAt(0).toUpperCase() + detectedCity.slice(1)}**:\n\n👉 ${searchUrl}\n\nWant me to set up automatic alerts so you're the first to know when new matches hit the market?`;
    } else if (lowerMsg.includes('dream') || lowerMsg.includes('looking for') || lowerMsg.includes('i want') || lowerMsg.includes('find me')) {
      reply = "Tell me more about your dream home! What features matter most? For example: pool, hardwood floors, walkout basement, home office, wine cellar. I'll build a personalized search for you instantly.";
    } else if (lowerMsg.includes('price') || lowerMsg.includes('worth') || lowerMsg.includes('valuation')) {
      reply = "I can definitely help with pricing! Our absolute best tool for this is the AI Home Valuation tool located in the 'Sell' tab. It will instantly calculate your home's worth based on active data.";
    } else if (lowerMsg.includes('showing') || lowerMsg.includes('see') || lowerMsg.includes('tour')) {
      reply = "I can book a showing for you within the hour. Just drop the address of the property or the MLS number here, and I'll schedule it with our team.";
    } else if (lowerMsg.includes('agent') || lowerMsg.includes('realtor') || lowerMsg.includes('broker')) {
      reply = "I am the ListingBooth AI Concierge. I leverage deep indexing to find exactly what you want. What kind of home are you looking for, and in which city?";
    } else if (lowerMsg.includes('alert') || lowerMsg.includes('notify') || lowerMsg.includes('text me')) {
      reply = "I'd love to send you instant alerts! Just share your phone number and what you're looking for (e.g. '4-bed with pool under $800K in Ottawa'), and I will text you the moment a match comes online.";
    }

    // 3. Insert Concierge's reply into unity_messages
    await getSupabaseAdmin()
      .from('unity_messages')
      .insert({
        channel: 'lead-inquiries',
        user_name: 'Concierge',
        user_role: 'system',
        avatar: '🛎️',
        content: reply,
      } as any);

    // 4. Return the reply to the Next.js frontend
    return NextResponse.json({ reply });

  } catch (error) {
    console.error('VABOT API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
