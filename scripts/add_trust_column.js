const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function run() {
    // We try to connect using the same pgUrl setup_d2b_schema.js used:
    const dbUrl = 'postgresql://postgres.qmsbvvnffaojddysvqmd:HAmKH0hFCnbCO109@aws-0-us-east-1.pooler.supabase.com:6543/postgres';
    const sql = postgres(dbUrl, { ssl: 'require', max: 1, prepare: false });
    
    try {
        console.log('[SUPABASE] Adding trust_details JSONB to builders table...');
        await sql.unsafe(`
            ALTER TABLE core_logic.builders 
            ADD COLUMN IF NOT EXISTS trust_details JSONB DEFAULT '{}'::jsonb;
        `);
        console.log('✅ Added trust_details JSONB column to core_logic.builders');
    } catch(err) {
        console.error('Failed to alter table:', err.message);
    } finally {
        await sql.end();
    }
}
run();
