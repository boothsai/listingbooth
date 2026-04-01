// Quick RPC verification test — with correct schema
import { createClient } from '@supabase/supabase-js';

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  db: { schema: 'geo_intel' }
});

// Test 1: Insert RPC
const { data, error } = await s.rpc('geo_intel_insert_boundary', {
  p_boundary_type: '_test_',
  p_city: 'Test',
  p_name: 'Test Point',
  p_code: 'T',
  p_attributes: {},
  p_geojson: '{"type":"Point","coordinates":[-79.38,43.65]}'
});
console.log('Insert RPC:', error ? `❌ ${error.message}` : '✅ OK');

// Test 2: Delete RPC
const { error: e2 } = await s.rpc('geo_intel_delete_layer', { p_layer_type: '_test_' });
console.log('Delete RPC:', e2 ? `❌ ${e2.message}` : '✅ OK');

// Test 3: Cross-routing RPC
const { data: d3, error: e3 } = await s.rpc('get_boundaries_intersecting', {
  search_lng: -79.38,
  search_lat: 43.65,
  layer_type: 'zoning'
});
console.log('Cross-routing RPC:', e3 ? `❌ ${e3.message}` : `✅ OK (${d3?.length || 0} results)`);
