import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  database: process.env.DB_NAME ?? 'property_search',
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'password',
  ssl: process.env.DB_SSLMODE === 'require'
    ? { rejectUnauthorized: false }
    : false,
});

async function runMigrations(): Promise<void> {
  const client = await pool.connect();

  try {
    // Create migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL PRIMARY KEY,
        filename   VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT id FROM _migrations WHERE filename = $1',
        [file],
      );

      if (rows.length > 0) {
        console.log(`[SKIP] ${file} — already applied`);
        continue;
      }

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`[RUN]  ${file}`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`[OK]   ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }

    console.log('\nAll migrations completed successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err: unknown) => {
  console.error('Migration failed:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
