import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './index'; // your drizzle schema

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export const connectDB = async () => {
  try {
    await pool.connect(); // Test the connection
    console.log('\x1b[32mDB:\x1b[0m Drizzle (Postgres) Connected');
  } catch (error) {
    console.error('Failed to connect to DB:', error);
    process.exit(1);
  }
};
