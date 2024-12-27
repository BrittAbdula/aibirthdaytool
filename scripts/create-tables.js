const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function createTables() {
    const client = new Client({
        connectionString: "postgres://postgres.wiiihffhzacjyhbjxgle:0WessxDNPxeToOLv@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
    });

    try {
        await client.connect();
        console.log('Connected to database');

        const sql = fs.readFileSync(path.join(__dirname, '../prisma/create-tables.sql'), 'utf8');
        await client.query(sql);
        console.log('Tables created successfully');

    } catch (error) {
        console.error('Error creating tables:', error);
    } finally {
        await client.end();
    }
}

createTables();
