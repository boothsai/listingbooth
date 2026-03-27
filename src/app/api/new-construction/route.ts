export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!,
    { cookies: { getAll() { return []; }, setAll() {} } }
  );
}

// Static seed data — used as fallback when table is empty
const SEED_PROJECTS = [
  {
    slug: 'the-greenwich',
    name: 'The Greenwich',
    builder: 'Tribute Communities',
    city: 'Toronto',
    province: 'ON',
    price_from: 599900,
    property_type: 'Condos & Townhomes',
    status: 'Now Selling',
    description: 'A stunning collection of premium condos and townhomes in the heart of Toronto by Tribute Communities. Featuring modern architecture, luxury finishes, and access to transit, parks, and world-class amenities. Starting from the low $600s.',
    features: ['Rooftop terrace', 'Gym & wellness centre', 'Underground parking', 'Concierge service', 'Steps to TTC'],
    completion_year: 2027,
    total_units: 320,
    color: '#2563eb',
    photo_url: null,
  },
  {
    slug: 'claridge-moon',
    name: 'Claridge Moon',
    builder: 'Claridge Homes',
    city: 'Ottawa',
    province: 'ON',
    price_from: 349900,
    property_type: 'Condominiums',
    status: 'Pre-Construction',
    description: 'Ottawa\'s most anticipated condominium community by Claridge Homes. Located in the vibrant Centretown neighbourhood, Claridge Moon offers stunning river views, walkable urban living, and prices starting in the mid $300s.',
    features: ['River views', 'Fitness centre', 'Party room', 'Pet wash station', 'Bike storage'],
    completion_year: 2028,
    total_units: 240,
    color: '#7c3aed',
    photo_url: null,
  },
  {
    slug: 'oro-at-edge-towers',
    name: 'Oro at Edge Towers',
    builder: 'Solmar Development',
    city: 'Mississauga',
    province: 'ON',
    price_from: 499900,
    property_type: 'High-Rise Condos',
    status: 'Now Selling',
    description: 'Rise above the ordinary at Oro, the crowning tower of Edge Towers in Mississauga\'s City Centre. With breathtaking views, resort-style amenities, and direct connection to Square One, this is GTA living at its finest.',
    features: ['50+ storey tower', 'Infinity pool', 'Co-working lounge', 'Connected to Square One', 'LRT access'],
    completion_year: 2027,
    total_units: 450,
    color: '#059669',
    photo_url: null,
  },
  {
    slug: 'upper-west-side',
    name: 'Upper West Side',
    builder: 'Branthaven Homes',
    city: 'Oakville',
    province: 'ON',
    price_from: 899900,
    property_type: 'Detached & Towns',
    status: 'Coming Soon',
    description: 'An exclusive collection of detached homes and townhomes in prestigious Oakville by Branthaven Homes. Premium finishes, oversized lots, and a family-friendly neighbourhood close to top-rated schools and lakefront trails.',
    features: ['Heritage-inspired architecture', '2-car garages', 'Premium lot sizes', 'Near top schools', 'Trail access'],
    completion_year: 2026,
    total_units: 85,
    color: '#dc2626',
    photo_url: null,
  },
];

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const city = req.nextUrl.searchParams.get('city');
    const status = req.nextUrl.searchParams.get('status');
    const slug = req.nextUrl.searchParams.get('slug');

    let query = supabase
      .from('new_construction_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (city) query = query.eq('city', city);
    if (status) query = query.eq('status', status);
    if (slug) query = query.eq('slug', slug).single();

    const { data, error } = await query;

    // If table doesn't exist or is empty, return seed data
    if (error || !data || (Array.isArray(data) && data.length === 0)) {
      if (slug) {
        const project = SEED_PROJECTS.find(p => p.slug === slug);
        return NextResponse.json({ project: project ?? null });
      }
      let filtered = SEED_PROJECTS;
      if (city) filtered = filtered.filter(p => p.city === city);
      if (status) filtered = filtered.filter(p => p.status === status);
      return NextResponse.json({ projects: filtered, _source: 'seed' });
    }

    if (slug) {
      return NextResponse.json({ project: data });
    }

    return NextResponse.json({ projects: data, _source: 'supabase' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg, projects: SEED_PROJECTS }, { status: 200 });
  }
}
