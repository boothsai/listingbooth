const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const coordinateMap = [
  { namePattern: '%Brookline%', lat: 45.33405, lng: -75.9272 },
  { namePattern: '%Harmony%', lat: 45.2635, lng: -75.7483 },
  { namePattern: '%Richmond Meadows%', lat: 45.1950, lng: -75.8340 },
  { namePattern: '%Claridge Moon%', lat: 45.4172, lng: -75.7061 },
  { namePattern: '%Upper West%', lat: 43.4862, lng: -79.7430 }
];

async function run() {
  console.log('Starting spatial data enrichment...');
  for (const item of coordinateMap) {
    const { data, error } = await supabase
      .schema('core_logic')
      .from('builder_communities')
      .update({ latitude: item.lat, longitude: item.lng })
      .ilike('name', item.namePattern)
      .select('name, latitude, longitude');
    
    if (error) {
      console.error(`Error updating ${item.namePattern}:`, error);
    } else {
      console.log(`Updated ${data?.length} records matching ${item.namePattern} to`, item.lat, item.lng);
    }
  }
  console.log('Spatial enrichment complete.');
}

run();
