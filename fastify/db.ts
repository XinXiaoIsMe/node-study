import type { Pool } from 'mysql2/promise';
import process from 'node:process';
import mysql from 'mysql2/promise';
import 'dotenv/config';

let pool: Pool | null = null;

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value)
    throw new Error(`Missing env: ${name}`);
  return value;
}

function envNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw)
    return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed))
    throw new Error(`Invalid number env: ${name}`);
  return parsed;
}

export function getMySqlPool(): Pool {
  if (pool)
    return pool;

  pool = mysql.createPool({
    host: requireEnv('MYSQL_HOST', '127.0.0.1'),
    port: envNumber('MYSQL_PORT', 3306),
    user: requireEnv('MYSQL_USER'),
    password: process.env.MYSQL_PASSWORD ?? '',
    database: requireEnv('MYSQL_DATABASE'),
    waitForConnections: true,
    connectionLimit: envNumber('MYSQL_CONNECTION_LIMIT', 10),
    queueLimit: 0,
    namedPlaceholders: true,
  });

  return pool;
}

export async function ensureTodoTable(): Promise<void> {
  const pool = getMySqlPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS todos (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      completed TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

export async function closeMySqlPool(): Promise<void> {
  if (!pool)
    return;
  const closing = pool;
  pool = null;
  await closing.end();
}
