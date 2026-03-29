const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
);

(async () => {
  // 1. Audit builder_products gaps
  const { data: products } = await s.schema('core_logic').from('builder_products').select('*, builder_communities(name, builder_id, builders(name))');
  
  console.log('=== BUILDER PRODUCTS AUDIT ===');
  console.log(`Total records: ${products.length}`);
  
  let missing = { model_name: 0, home_type: 0, beds: 0, baths: 0, sqft: 0 };
  
  products.forEach(p => {
    if (!p.model_name) missing.model_name++;
    if (!p.home_type) missing.home_type++;
    if (!p.beds) missing.beds++;
    if (!p.baths) missing.baths++;
    if (!p.sqft) missing.sqft++;
    
    const comm = p.builder_communities?.name || 'Unknown';
    const builder = p.builder_communities?.builders?.name || 'Unknown';
    console.log(`  [${p.id.slice(0,8)}] ${comm} | model:${p.model_name||'❌'} | type:${p.home_type||'❌'} | ${p.beds||'❌'}bd/${p.baths||'❌'}ba | ${p.sqft||'❌'}sf | $${p.price_from} | builder:${builder}`);
  });
  
  console.log('\n=== GAPS ===');
  Object.entries(missing).forEach(([k, v]) => console.log(`  ${k}: ${v}/${products.length} missing`));
  
  // 2. Audit communities without hero images
  const { data: communities } = await s.schema('core_logic').from('builder_communities').select('id, name, hero_image_url, latitude, longitude');
  console.log('\n=== COMMUNITIES ===');
  let noImage = 0, noCoords = 0;
  communities.forEach(c => {
    if (!c.hero_image_url) noImage++;
    if (!c.latitude || !c.longitude) noCoords++;
    console.log(`  ${c.name} | img:${c.hero_image_url ? '✅' : '❌'} | coords:${c.latitude ? '✅' : '❌'}`);
  });
  console.log(`\n  Missing images: ${noImage}/${communities.length}`);
  console.log(`  Missing coords: ${noCoords}/${communities.length}`);
})();
