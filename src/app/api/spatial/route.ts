export const runtime = 'edge';

/**
 * GET /api/spatial?type=zoning&lat=45.4215&lng=-75.6972
 * GET /api/spatial?type=flood-risk&lat=45.4215&lng=-75.6972
 * GET /api/spatial?type=schools&lat=45.4215&lng=-75.6972
 * GET /api/spatial?type=demographics&lat=45.4215&lng=-75.6972
 * GET /api/spatial?type=amenities&lat=45.4215&lng=-75.6972
 * GET /api/spatial?type=full&lat=45.4215&lng=-75.6972  ← all in one
 *
 * The Neighbourhood Intelligence API — powered by Open Ottawa + ArcGIS
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getZoning,
  getFloodRisk,
  getNearbySchools,
  getDemographics,
  getNearbyTransit,
  getNearbyAmenities,
  getNearbyDevApps,
  getNearbyCrimes,
  getNearbyPermits,
  getFullSpatialContext,
} from '@/lib/supabase/geo-intel';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const s = req.nextUrl.searchParams;
    const type = s.get('type');
    const lat = parseFloat(s.get('lat') || '');
    const lng = parseFloat(s.get('lng') || '');

    // Validate
    if (!type) {
      return NextResponse.json(
        { error: 'Missing required parameter: type', valid_types: ['zoning', 'flood-risk', 'schools', 'demographics', 'transit', 'amenities', 'dev-apps', 'crime', 'building-permits', 'full'] },
        { status: 400 }
      );
    }
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Missing or invalid lat/lng parameters' },
        { status: 400 }
      );
    }

    // Auth verification for gated layers (edge-compatible)
    const GATED_TYPES = ['dev-apps', 'building-permits', 'crime'];
    if (GATED_TYPES.includes(type)) {
      // Read the Supabase auth token from cookies
      const cookieHeader = req.headers.get('cookie') || '';
      const accessToken = cookieHeader
        .split(';')
        .map(c => c.trim())
        .find(c => c.startsWith('sb-') && c.includes('-auth-token'))
        ?.split('=')
        .slice(1)
        .join('=');

      if (!accessToken) {
        return NextResponse.json(
          { error: 'Unauthorized: Premium data module. Please sign in to access.', code: 'GATED_DATA_ACCESS' },
          { status: 401 }
        );
      }

      // Verify the token is valid
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser(decodeURIComponent(accessToken));
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid or expired session.', code: 'GATED_DATA_ACCESS' },
          { status: 401 }
        );
      }
    }

    let data: unknown;
    let source = 'GeoIntelligence Engine — ListingBooth.com';

    switch (type) {
      case 'zoning':
        data = await getZoning(lat, lng);
        source = 'City of Ottawa Open Data';
        break;
      case 'flood-risk':
        data = await getFloodRisk(lat, lng);
        source = 'City of Ottawa — Flood Plain Overlay';
        break;
      case 'schools':
        data = await getNearbySchools(lat, lng, parseFloat(s.get('radius') || '3'));
        source = 'City of Ottawa — Schools MapServer';
        break;
      case 'demographics':
        data = await getDemographics(lat, lng);
        source = 'Statistics Canada, 2021 Census';
        break;
      case 'amenities':
        data = await getNearbyAmenities(lat, lng, parseFloat(s.get('radius') || '2'));
        source = 'City of Ottawa — Parks & Recreation';
        break;
      case 'transit':
        data = await getNearbyTransit(lat, lng, parseFloat(s.get('radius') || '3'));
        source = 'City of Ottawa — OC Transpo / LRT';
        break;
      case 'dev-apps':
        data = await getNearbyDevApps(lat, lng, parseFloat(s.get('radius') || '1.5'));
        source = 'City of Ottawa — Development Applications';
        break;
      case 'crime':
        data = await getNearbyCrimes(lat, lng, parseFloat(s.get('radius') || '1.5'));
        source = 'Ottawa Police Service — Crime Locations';
        break;
      case 'building-permits':
        data = await getNearbyPermits(lat, lng, parseFloat(s.get('radius') || '2'));
        source = 'City of Ottawa — Construction Forecast';
        break;
      case 'full':
        data = await getFullSpatialContext(lat, lng);
        source = 'GeoIntelligence Engine (Open Ottawa + Census)';
        break;
      default:
        return NextResponse.json(
          { error: `Unknown type: ${type}`, valid_types: ['zoning', 'flood-risk', 'schools', 'demographics', 'transit', 'amenities', 'dev-apps', 'crime', 'building-permits', 'full'] },
          { status: 400 }
        );
    }

    return NextResponse.json({
      type,
      coordinates: { lat, lng },
      data,
      _attribution: {
        source,
        engine: 'ListingBooth GeoIntelligence Engine v1.0',
        cached: false,
        timestamp: new Date().toISOString(),
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown spatial query error';
    console.error('[spatial]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
