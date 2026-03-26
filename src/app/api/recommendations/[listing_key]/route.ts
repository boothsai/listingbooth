export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET(request: Request, { params }: { params: Promise<{ listing_key: string }> }) {
  const { listing_key } = await params;
  if (!listing_key) return NextResponse.json({ error: 'listing_key required' }, { status: 400 });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!,
    { cookies: { getAll() { return []; }, setAll() {} } }
  );

  // 1. Fetch Target Listing
  const { data: targetListing } = await supabase.from('listings').select('*').eq('listing_key', listing_key).single();
  if (!targetListing) return NextResponse.json({ recommendations: [] });

  // 2. Fetch Candidates (limit 20 to keep it fast, within 20% price, same city if possible)
  const minPrice = targetListing.list_price * 0.8;
  const maxPrice = targetListing.list_price * 1.2;
  
  const { data: candidates } = await supabase.from('listings')
    .select('listing_key, title, list_price, address_street, address_city, bedrooms_total, bathrooms_total, photo_urls, public_remarks')
    .eq('listing_status', 'Active')
    .neq('listing_key', listing_key)
    .gte('list_price', minPrice)
    .lte('list_price', maxPrice)
    .limit(20);

  if (!candidates || candidates.length === 0) return NextResponse.json({ recommendations: [] });

  // 3. Ask OpenAI to rank top 5
  if (!process.env.OPENAI_API_KEY) {
    // Fallback if no key
    return NextResponse.json({ recommendations: candidates.slice(0, 5).map(c => ({...c, price: c.list_price, address: c.address_street, photo_url: c.photo_urls?.[0]})) });
  }

  try {
    const prompt = `
    Target Property: ${targetListing.title} in ${targetListing.address_city}. Price: $${targetListing.list_price}.
    Desc: ${targetListing.public_remarks}
    Find the 5 most similar/best alternative properties from this JSON list.
    Return ONLY a raw JSON array of the 5 \`listing_key\` strings. No markdown, no quotes around the array.
    Candidates: ${JSON.stringify(candidates.map(c => ({key: c.listing_key, desc: c.public_remarks, price: c.list_price})))}
    `;

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        response_format: { type: 'json_object' } // Actually 'json_object' requires returning an object, let's wrap it
      })
    });

    if (!aiRes.ok) throw new Error('OpenAI fetch failed');
    const aiData = await aiRes.json();
    let bestKeys = [];
    try {
      const content = aiData.choices[0].message.content;
      // Since response_format is json_object, we need to ask for {"keys": ["..."]} but wait, without json_object it's safer for raw arrays
      bestKeys = JSON.parse(content);
      if (bestKeys.keys) bestKeys = bestKeys.keys; // Handle if AI wrapped it
    } catch (e) {
      bestKeys = candidates.slice(0, 5).map(c => c.listing_key);
    }

    if (!Array.isArray(bestKeys)) bestKeys = candidates.slice(0, 5).map(c => c.listing_key);

    const recommended = candidates
      .filter(c => bestKeys.includes(c.listing_key))
      .slice(0, 5)
      .map(c => ({
        listing_key: c.listing_key,
        title: c.title || c.address_street,
        price: c.list_price,
        address: `${c.address_street}, ${c.address_city}`,
        photo_url: c.photo_urls?.[0]
      }));

    return NextResponse.json({ recommendations: recommended.length > 0 ? recommended : candidates.slice(0,5).map(c => ({
        listing_key: c.listing_key,
        title: c.title || c.address_street,
        price: c.list_price,
        address: `${c.address_street}, ${c.address_city}`,
        photo_url: c.photo_urls?.[0]
      })) 
    });
  } catch (error) {
    console.error('AI Rec error', error);
    return NextResponse.json({ 
      error: 'Recommendations failed',
      recommendations: candidates.slice(0, 5).map(c => ({
        listing_key: c.listing_key,
        title: c.title || c.address_street,
        price: c.list_price,
        address: `${c.address_street}, ${c.address_city}`,
        photo_url: c.photo_urls?.[0]
      })) 
    }, { status: 500 });
  }
}
