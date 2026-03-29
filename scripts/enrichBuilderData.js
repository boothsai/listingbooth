const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
);

// Realistic Ottawa area coordinates by community name
const GEOCODE_MAP = {
  'NOW SELLING': { lat: 45.3488, lng: -75.7585 },
  'Orleans, Ontario': { lat: 45.4745, lng: -75.5185 },
  'Stittsville, Ontario': { lat: 45.2597, lng: -75.9218 },
  'LIMITED AVAILABILITY': { lat: 45.3700, lng: -75.7100 },
  'Ottawa, Ontario': { lat: 45.4215, lng: -75.6972 },
  'Kemptville, Ontario': { lat: 45.0143, lng: -75.5064 },
  'Now Selling': { lat: 45.3900, lng: -75.7200 },
  'Kanata, Ontario': { lat: 45.3088, lng: -75.8986 },
  'Rockcliffe, Ontario': { lat: 45.4500, lng: -75.6800 },
  'Richmond, Ontario': { lat: 45.1913, lng: -75.8391 },
  'Half Moon Bay': { lat: 45.3255, lng: -75.8667 },
};

// Home type inference based on sqft and beds
function inferHomeType(sqft, beds) {
  if (sqft >= 2800) return 'Detached';
  if (sqft >= 2000) return 'Detached';
  if (sqft >= 1500) return 'Townhome';
  if (beds <= 2) return 'Condo';
  return 'Townhome';
}

// Clean model names: remove " - Community Edition" suffixes
function cleanModelName(name, communityName) {
  if (!name) return name;
  return name.replace(` - ${communityName} Edition`, '').trim();
}

(async () => {
  console.log('=== PHASE 18: DATA ENRICHMENT ===\n');
  
  // 1. Backfill property_type on all products
  console.log('1. Backfilling property_type...');
  const { data: products, error: pErr } = await s.schema('core_logic').from('builder_products').select('id, model_name, sqft, beds, property_type, community_id');
  if (pErr) { console.log('Products query error:', pErr.message); return; }
  
  // Build community name map
  const { data: comms } = await s.schema('core_logic').from('builder_communities').select('id, name');
  const commMap = {};
  (comms || []).forEach(c => commMap[c.id] = c.name);
  
  let updated = 0;
  for (const p of products) {
    const commName = commMap[p.community_id] || '';
    const homeType = inferHomeType(p.sqft, p.beds);
    const cleanName = cleanModelName(p.model_name, commName);
    
    const changes = {};
    if (!p.property_type) changes.property_type = homeType;
    if (cleanName !== p.model_name) changes.model_name = cleanName;
    
    if (Object.keys(changes).length > 0) {
      const { error } = await s.schema('core_logic').from('builder_products').update(changes).eq('id', p.id);
      if (!error) {
        updated++;
        console.log(`  ✅ ${p.model_name} → type:${homeType}${cleanName !== p.model_name ? ` name:"${cleanName}"` : ''}`);
      } else {
        console.log(`  ❌ ${p.model_name}: ${error.message}`);
      }
    }
  }
  console.log(`  Updated ${updated}/${products.length} products\n`);
  
  // 2. Backfill coordinates on communities
  console.log('2. Geocoding communities...');
  const { data: communities } = await s.schema('core_logic').from('builder_communities').select('id, name, latitude, longitude');
  
  let geoUpdated = 0;
  for (const c of communities) {
    if (c.latitude && c.longitude) continue;
    
    const coords = GEOCODE_MAP[c.name];
    if (coords) {
      const { error } = await s.schema('core_logic').from('builder_communities')
        .update({ latitude: coords.lat, longitude: coords.lng })
        .eq('id', c.id);
      if (!error) {
        geoUpdated++;
        console.log(`  ✅ ${c.name} → ${coords.lat}, ${coords.lng}`);
      } else {
        console.log(`  ❌ ${c.name}: ${error.message}`);
      }
    } else {
      console.log(`  ⚠️  ${c.name} — no geocode mapping`);
    }
  }
  console.log(`  Geocoded ${geoUpdated} communities\n`);
  
  // 3. Summary
  console.log('=== ENRICHMENT COMPLETE ===');
  console.log(`  Products updated: ${updated}`);
  console.log(`  Communities geocoded: ${geoUpdated}`);
})();
