require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL.trim();
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim(); // Needs service role key ideally, but we will try anon if anon has rights or just use a raw query if available

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log("Reading migration SQL...");
    const sqlPath = path.join(__dirname, 'supabase', 'migrations', '003_add_avatars_bucket.sql');
    let sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Running SQL...");
    // Since anon key can't run raw SQL, we will directly use the JS storage API to create the bucket
    // Note: createBucket requires elevated privileges, so if it fails, the user must run the SQL manually in their dashboard.
    try {
        const { data, error } = await supabase.storage.createBucket('avatars', {
            public: true,
            fileSizeLimit: 2097152 // 2MB
        });

        if (error) {
            console.error("Storage error (creating bucket):", error.message);
            console.log("Please run 003_add_avatars_bucket.sql manually in the Supabase SQL Editor.");
        } else {
            console.log("Successfully created 'avatars' bucket programmatically.");
        }

    } catch (err) {
        console.error("Exception:", err);
    }
}

runMigration();
