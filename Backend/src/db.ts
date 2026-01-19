import { Pool, QueryResult } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in the environment..');
}

const pool = new Pool({
    connectionString: connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
    console.error('Unexpected error in idle pool client', err);
    process.exit(-1);
});

console.log('PostgreSQL connection pool initialized.');

// Utility function for executing queries.
export const query = (text: string, params?: any[]): Promise<QueryResult> => {
    return pool.query(text, params);
};

export const connectDB = async () => {
    try {
        await pool.query('SELECT 1');
        console.log(' Connection to PostgreSQL successful.!');
    } catch (err) {
        console.error('Connection to PostgreSQL failed:', err);
        throw err;
    }
};
export const closeDB = () => {
    pool.end();
    console.log('PostgreSQL connection pool closed.');
};

export const setupDatabase = async () => {
    try {
        const sqlFilePath = path.join(__dirname, './database.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        console.log(' Creating tables...');
        await pool.query(sql);
        console.log('Tables created/verified successfully!');
    } catch (err) {
        console.error('Error creating tables:', err);
    }
};