import 'dotenv/config';
import pg from 'pg';

// Force allow self-signed certificates for the entire process
// This is often necessary in environments where the pg library's SSL config 
// might be overridden or not fully respected by underlying native bindings.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is missing! Please set it in Vercel project settings.');
    }
    
    console.log('Initializing database pool...');
    
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
    
    console.log('Database pool initialized with SSL bypass (rejectUnauthorized: false)');
  }
  return pool;
}

export const query = (text: string, params?: any[]) => {
  const p = getPool();
  return p.query(text, params);
};

export default { query, getPool };
