import 'dotenv/config';
import { Pool, type PoolConfig } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required.');
}

const config: PoolConfig = {
  connectionString: databaseUrl
    .replace('&sslmode=no-verify', '')
    .replace('&sslmode=require', ''),
  ssl: {
    rejectUnauthorized: false,
  },
  options: '-c search_path=plan_vision',
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
export const pool = new Pool(config);
