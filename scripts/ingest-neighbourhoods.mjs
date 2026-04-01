import { createClient } from '@supabase/supabase-js';

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  db: { schema: 'geo_intel' }
});

// Use CKAN Datastore API to fetch records with geometry
const resourceId = '5e6095fc-1bef-4776-887c-28d37f722c51';
const url = `https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/datastore_search?resource_id=${resourceId}&limit=500`;

console.log('⬇️  Fetching neighbourhoods from CKAN API...');
const res = await fetch(url);
const body = await res.json();
const records = body.result?.records || [];
console.log(`✅ Got ${records.length} neighbourhoods`);

if (records.length === 0) {
  console.log('No records found, exiting');
  process.exit(0);
}

// Clear existing
await s.rpc('geo_intel_delete_layer', { p_layer_type: 'toronto_neighbourhood' });

let ok = 0;
for (const rec of records) {
  // CKAN datastore returns geometry as a column (usually 'geometry' or 'SHAPE')
  const geomField = rec.geometry || rec.SHAPE || rec.geom;
  if (!geomField) {
    // Try WKT or other fields
    console.log('Record keys:', Object.keys(rec).join(', '));
    break;
  }
  
  const geojson = typeof geomField === 'string' ? geomField : JSON.stringify(geomField);
  
  const { error } = await s.rpc('geo_intel_insert_boundary', {
    p_boundary_type: 'toronto_neighbourhood',
    p_city: 'Toronto',
    p_name: String(rec.AREA_NAME || rec.FIELD_7 || 'Unknown'),
    p_code: String(rec.AREA_SHORT_CODE || rec.FIELD_1 || 'UNK'),
    p_attributes: rec,
    p_geojson: geojson,
  });
  if (!error) ok++;
  else if (ok === 0) console.log('⚠️', error.message);
}
console.log(`✅ Inserted ${ok} neighbourhoods`);
