import { Pool, PoolConfig } from 'pg';
import { logger } from '../utils/logger';

const isProduction = process.env.NODE_ENV === 'production';

const poolConfig: PoolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 8000,
    }
  : {
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      database: process.env.DB_NAME ?? 'property_search',
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'password',
      ssl: isProduction || process.env.DB_SSLMODE === 'require'
        ? { rejectUnauthorized: false }
        : false,
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 8000,
    };

export const pool = new Pool(poolConfig);

pool.on('error', (err: Error) => {
  logger.error('Unexpected error on idle PostgreSQL client', err.message);
});

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch {
    return false;
  }
}
