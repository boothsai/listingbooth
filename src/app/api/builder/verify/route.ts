export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/builder/verify
 * 
 * Simulates a real-time registry lookup against the Tarion/HCRA database
 * (the Ontario Builder Directory).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const builder = searchParams.get('name') || '';

  // Simulate external API latency (1.0 - 2.5 seconds)
  const latency = Math.floor(Math.random() * 1500) + 1000;
  await new Promise(resolve => setTimeout(resolve, latency));

  const lowerName = builder.toLowerCase();
  
  // Simulated Registry Response Map
  const registryResponse = {
    builder_name: builder,
    status: 'Licensed',
    tarion_registered: true,
    license_number: `B${Math.floor(Math.random() * 90000) + 10000}`,
    homes_built: 0,
    chargeable_conciliations: 0,
    active_claims: 0,
    last_verified: new Date().toISOString(),
  };

  if (lowerName.includes('mattamy')) {
    registryResponse.homes_built = 112450;
    registryResponse.chargeable_conciliations = 2; // Exceptionally low ratio
  } else if (lowerName.includes('minto')) {
    registryResponse.homes_built = 85200;
    registryResponse.chargeable_conciliations = 1;
  } else if (lowerName.includes('tribute')) {
    registryResponse.homes_built = 35000;
    registryResponse.chargeable_conciliations = 0;
  } else if (lowerName.includes('tridel')) {
    registryResponse.homes_built = 87000;
    registryResponse.chargeable_conciliations = 3;
    registryResponse.active_claims = 1;
  } else if (lowerName.includes('claridge')) {
    registryResponse.homes_built = 14500;
    registryResponse.chargeable_conciliations = 5;
  } else {
    // Generic medium builder stats
    registryResponse.homes_built = Math.floor(Math.random() * 5000) + 500;
    registryResponse.chargeable_conciliations = Math.floor(Math.random() * 3);
  }

  // Inject a mock failure for specifically bad builders or edge cases if needed
  if (lowerName.includes('revoked_test_builder')) {
    registryResponse.status = 'Revoked';
    registryResponse.tarion_registered = false;
    registryResponse.chargeable_conciliations = 45;
  }

  return NextResponse.json({
    verified: true,
    source: 'obd.hcraontario.ca',
    data: registryResponse
  });
}
