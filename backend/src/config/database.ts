import { Pool } from 'pg';
import { env } from './env';

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

// Log when a new connection is established (development only)
pool.on('connect', () => {
  if (env.nodeEnv === 'development') {
    console.log('📦 New database connection established');
  }
});

// Handle unexpected errors
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

// Helper to perform queries with timing
export const query = async <T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  if (env.nodeEnv === 'development') {
    console.log(`Query executed in ${duration}ms`);
  }

  return result.rows as T[];
};

// Helper to get a client for transactions
export const getClient = () => pool.connect();