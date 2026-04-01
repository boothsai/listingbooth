import { createClient } from '@supabase/supabase-js';
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  db: { schema: 'geo_intel' }
});

console.log('━━━ Phase P5 Final Verification ━━━\n');

// Count all layers
const { count: zoning } = await s.from('boundaries').select('*', { count: 'exact', head: true }).eq('boundary_type', 'toronto_zoning');
const { count: hoods } = await s.from('boundaries').select('*', { count: 'exact', head: true }).eq('boundary_type', 'toronto_neighbourhood');
console.log(`Toronto Zoning polygons:        ${zoning}`);
console.log(`Toronto Neighbourhood polygons: ${hoods}`);

// Test CN Tower - Zoning (proximity)
const { data: z1 } = await s.rpc('get_boundaries_within', {
  search_lng: -79.3871, search_lat: 43.6426, radius_meters: 100, layer_types: ['toronto_zoning']
});
console.log(`\n🏗️  CN Tower Zoning (100m):     ${z1?.length} zones → ${z1?.map(d => d.code).join(', ')}`);

// Test CN Tower - Neighbourhood (intersection)
const { data: n1 } = await s.rpc('get_boundaries_intersecting', {
  search_lng: -79.3871, search_lat: 43.6426, layer_type: 'toronto_neighbourhood'
});
console.log(`🏘️  CN Tower Neighbourhood:     ${n1?.length ? n1[0].name : 'none'}`);

// Test Queen & Spadina
const { data: z2 } = await s.rpc('get_boundaries_within', {
  search_lng: -79.3960, search_lat: 43.6488, radius_meters: 50, layer_types: ['toronto_zoning']
});
console.log(`🏗️  Queen & Spadina Zoning:     ${z2?.length} zones → ${z2?.[0]?.code}`);

const { data: n2 } = await s.rpc('get_boundaries_intersecting', {
  search_lng: -79.3960, search_lat: 43.6488, layer_type: 'toronto_neighbourhood'
});
console.log(`🏘️  Queen & Spadina Hood:       ${n2?.length ? n2[0].name : 'none'}`);

// Test Yonge & Bloor
const { data: z3 } = await s.rpc('get_boundaries_within', {
  search_lng: -79.3868, search_lat: 43.6709, radius_meters: 50, layer_types: ['toronto_zoning']
});
console.log(`🏗️  Yonge & Bloor Zoning:       ${z3?.length} zones → ${z3?.[0]?.code}`);

const { data: n3 } = await s.rpc('get_boundaries_intersecting', {
  search_lng: -79.3868, search_lat: 43.6709, layer_type: 'toronto_neighbourhood'
});
console.log(`🏘️  Yonge & Bloor Hood:         ${n3?.length ? n3[0].name : 'none'}`);

console.log('\n✅ Phase P5 Verification Complete!');
