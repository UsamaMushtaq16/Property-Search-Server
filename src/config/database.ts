import { Pool, PoolConfig } from 'pg';
import { logger } from '../utils/logger';

function createPool(): Pool {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
    throw new Error('No database configuration found. Set DATABASE_URL environment variable.');
  }

  const poolConfig: PoolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 3,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 8000,
      }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        database: process.env.DB_NAME ?? 'property_search',
        user: process.env.DB_USER ?? 'postgres',
        password: process.env.DB_PASSWORD,
        ssl: isProduction || process.env.DB_SSLMODE === 'require'
          ? { rejectUnauthorized: false }
          : false,
        max: 3,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 8000,
      };

  const p = new Pool(poolConfig);
  p.on('error', (err: Error) => {
    logger.error('Unexpected error on idle PostgreSQL client', err.message);
  });
  return p;
}

export const pool = createPool();

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch {
    return false;
  }
}
