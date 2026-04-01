// Test if Toronto zoning geometry works with PostGIS ST_Intersects
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { db: { schema: 'geo_intel' } }
);

// Test 1: Does the RPC work with the new city-based routing?
console.log('Test 1: RPC get_boundaries_intersecting for Toronto downtown...');
const { data: z, error: e1 } = await s.rpc('get_boundaries_intersecting', {
  search_lng: -79.3832,
  search_lat: 43.6532,
  layer_type: 'zoning'
});
console.log('  Result:', z?.length || 0, 'rows', e1 || '');

// Test 2: Does Ottawa still work?
console.log('Test 2: RPC get_boundaries_intersecting for Ottawa Glebe...');
const { data: oz, error: e2 } = await s.rpc('get_boundaries_intersecting', {
  search_lng: -75.6885,
  search_lat: 45.3988,
  layer_type: 'zoning'
});
console.log('  Result:', oz?.length || 0, 'rows', e2 || '');
if (oz?.[0]) console.log('  First Ottawa zone:', oz[0].code, oz[0].name);

// Test 3: Check raw SQL for geom column type
console.log('\nTest 3: Checking sample Toronto zoning geom...');
const { data: sample } = await s.from('boundaries')
  .select('id, code, geom')
  .eq('city', 'toronto')
  .eq('boundary_type', 'zoning')
  .limit(1);

if (sample?.[0]) {
  const geomStr = JSON.stringify(sample[0].geom).slice(0, 200);
  console.log('  geom type:', typeof sample[0].geom);
  console.log('  geom preview:', geomStr);
}

// Test 4: Check if flood data exists
console.log('\nTest 4: Flood data check...');
const { count: floodCount } = await s.from('boundaries')
  .select('*', { count: 'exact', head: true })
  .eq('city', 'toronto')
  .eq('boundary_type', 'flood');
console.log('  Toronto flood rows:', floodCount);

const { count: floodCount2 } = await s.from('boundaries')
  .select('*', { count: 'exact', head: true })
  .eq('city', 'toronto')
  .eq('boundary_type', 'flood_plain');
console.log('  Toronto flood_plain rows:', floodCount2);
