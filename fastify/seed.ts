import type { RowDataPacket } from 'mysql2/promise';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

function parseDotEnv(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#'))
      continue;
    const idx = line.indexOf('=');
    if (idx === -1)
      continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\'')))
      value = value.slice(1, -1);
    if (key)
      out[key] = value;
  }
  return out;
}

async function loadEnvFileIfPresent(filePath: string) {
  if (!existsSync(filePath))
    return;
  const raw = await readFile(filePath, 'utf8');
  const env = parseDotEnv(raw);
  for (const [key, value] of Object.entries(env)) {
    if (typeof process.env[key] === 'undefined')
      process.env[key] = value;
  }
}

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

async function main() {
  const dir = dirname(fileURLToPath(import.meta.url));
  await loadEnvFileIfPresent(join(dir, '.env'));

  const host = requireEnv('MYSQL_HOST', '127.0.0.1');
  const port = envNumber('MYSQL_PORT', 3306);
  const user = requireEnv('MYSQL_USER');
  const password = process.env.MYSQL_PASSWORD ?? '';
  const database = requireEnv('MYSQL_DATABASE');

  const serverConn = await mysql.createConnection({ host, port, user, password });
  await serverConn.execute(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`,
  );
  await serverConn.end();

  const pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: envNumber('MYSQL_CONNECTION_LIMIT', 10),
    queueLimit: 0,
    namedPlaceholders: true,
  });

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

  interface CountRow extends RowDataPacket {
    c: number;
  }
  const [rows] = await pool.query<CountRow[]>('SELECT COUNT(*) AS c FROM todos');
  if ((rows[0]?.c ?? 0) === 0) {
    await pool.execute(
      'INSERT INTO todos (title, completed) VALUES (:t1, 0), (:t2, 0)',
      { t1: '写一个 Todo', t2: '把它标记为已完成' },
    );
  }

  await pool.end();
  // eslint-disable-next-line no-console
  console.log('Seed complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
