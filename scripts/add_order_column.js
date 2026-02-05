const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function addColumn() {
    try {
        console.log('Checking for display_order column in Scooter table...');

        // Check if column exists
        const checkRes = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Scooter' AND column_name = 'display_order'
    `);

        if (checkRes.rowCount === 0) {
            console.log('Adding display_order column...');
            await pool.query('ALTER TABLE "Scooter" ADD COLUMN display_order INTEGER DEFAULT 0');
            console.log('Column added successfully.');
        } else {
            console.log('display_order column already exists.');
        }

    } catch (err) {
        console.error('Error modifying table:', err);
    } finally {
        await pool.end();
    }
}

addColumn();
