import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../shared/schema';
import { env } from 'process';

const { Pool } = pg;

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

// Initialize Drizzle with the pool
export const db = drizzle(pool, { schema });

// Export the Pool instance in case we need direct access
export { pool };