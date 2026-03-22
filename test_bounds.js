require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testBounds() {
  console.log('Fetching bounds for Ottawa box...');
  const minLat = 45.3;
  const maxLat = 45.5;
  const minLng = -75.8;
  const maxLng = -75.5;

  let query = supabase
      .from('listings')
      .select('listing_key, address_street, address_city, latitude, longitude')
      .gte('latitude', minLat)
      .lte('latitude', maxLat)
      .gte('longitude', minLng)
      .lte('longitude', maxLng)
      .limit(10);

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching bounds:', error);
  } else {
    console.log(`Bounds returned ${data.length} listings.`);
    if (data.length > 0) console.log('Sample:', data[0]);
  }

  // Next, try without bounds just to see if we have ANY listings with Ottawa
  console.log('\nFetching generic Ottawa listings...');
  const { data: cityData } = await supabase.from('listings').select('listing_key, address_street, address_city, latitude, longitude').ilike('address_city', '%Ottawa%').limit(5);
  console.log(`Found ${cityData?.length || 0} listings with ILIKE %Ottawa%`);
  if (cityData && cityData.length > 0) {
      console.log('Sample Ottawa coords:', cityData[0].latitude, cityData[0].longitude, 'City string:', `"${cityData[0].address_city}"`);
  }
}

testBounds();
