require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY,
  { db: { schema: 'core_logic' } }
);

async function check() {
  const { data: bData, error: bErr } = await supabase.from('builders').select('*');
  console.log('BUILDERS:', bData);
  
  const { data: cData, error: cErr } = await supabase.from('builder_communities').select('*, builders(name)');
  console.log('COMMUNITIES:', cData);
}
check();
