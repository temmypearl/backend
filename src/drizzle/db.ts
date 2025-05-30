import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from './../config';
import * as schema from './index'; // your drizzle schema

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export const connectDB = async () => {
  try {
    const client = await pool.connect(); // Test the connection
   
    client.release(); 
   
  } catch (error) {
    console.error('Failed to connect to DB:', error);
    process.exit(1);
  }
};
