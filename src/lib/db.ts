import 'dotenv/config';
import pg from 'pg';

// Force allow self-signed certificates for the entire process
// This is often necessary in environments where the pg library's SSL config 
// might be overridden or not fully respected by underlying native bindings.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = pg;

// Use a global variable to preserve the pool across hot reloads in development
// and potentially across function invocations in some serverless environments.
const globalForPg = global as unknown as { pool: pg.Pool };

export function getPool() {
  if (!globalForPg.pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is missing! Please set it in Vercel project settings.');
    }
    
    console.log('Initializing database pool...');
    
    globalForPg.pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      // Serverless optimizations:
      // For free tier DBs with limited connections, we should keep 'max' very low.
      // If multiple serverless instances are running, each will take 'max' connections.
      max: process.env.VERCEL === '1' ? 2 : 10, 
      idleTimeoutMillis: 10000, // Close idle connections faster to free up slots for other instances
      connectionTimeoutMillis: 5000, // Fail fast if we can't get a connection
      allowExitOnIdle: true, // Allow the process to exit if the pool is idle
    });

    globalForPg.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
    
    console.log(`Database pool initialized (max connections: ${process.env.VERCEL === '1' ? 2 : 10})`);
  }
  return globalForPg.pool;
}

export const query = async (text: string, params?: any[]) => {
  const p = getPool();
  let retries = 5; // Increased retries for limited connection environments
  let delay = 200;
  
  while (retries > 0) {
    try {
      return await p.query(text, params);
    } catch (err: any) {
      // Retry on connection exhaustion errors
      const isConnectionError = 
        err.message.includes('remaining connection slots') || 
        err.message.includes('too many connections') ||
        err.message.includes('connection limit exceeded') ||
        err.message.includes('Pool is full') ||
        err.message.includes('timeout exceeded when acquiring a connection');

      if (isConnectionError && retries > 1) {
        retries--;
        console.warn(`Database connection busy, retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 200));
        delay *= 2; // Exponential backoff
        continue;
      }
      throw err;
    }
  }
  return p.query(text, params); // Final attempt
};

export default { query, getPool };
