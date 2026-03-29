const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
);

(async () => {
  // Get products with builder/community info
  const { data: products, error: e1 } = await s
    .schema('core_logic')
    .from('builder_products')
    .select('model_name, home_type, beds, baths, sqft, price_from, community_id')
    .limit(10);
  
  if (e1) console.log('Products error:', e1.message);
  else {
    console.log('=== BUILDER PRODUCTS ===');
    products.forEach(r => {
      console.log(`  ${r.model_name} | ${r.home_type} | ${r.beds}bd/${r.baths}ba | ${r.sqft}sqft | $${r.price_from} | community:${r.community_id}`);
    });
  }

  // Get communities with builder join
  const { data: communities, error: e2 } = await s
    .schema('core_logic')
    .from('builder_communities')
    .select('id, name, city, status, latitude, longitude, builders(name, trust_score)')
    .limit(10);

  if (e2) console.log('Communities error:', e2.message);
  else {
    console.log('\n=== COMMUNITIES ===');
    communities.forEach(c => {
      console.log(`  ${c.name} | ${c.city} | ${c.status} | lat:${c.latitude} lng:${c.longitude} | builder:${c.builders?.name} score:${c.builders?.trust_score}`);
    });
  }

  // Get builder info
  const { data: builders, error: e3 } = await s
    .schema('core_logic')
    .from('builders')
    .select('*')
    .limit(10);

  if (e3) console.log('Builders error:', e3.message);
  else {
    console.log('\n=== BUILDERS ===');
    builders.forEach(b => {
      console.log(`  ${b.name} | score:${b.trust_score} | `, JSON.stringify(b));
    });
  }
})();
