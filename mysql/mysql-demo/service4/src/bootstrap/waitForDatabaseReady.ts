/* eslint-disable no-console */
import process from 'node:process';
import { env } from '@config/env';
import mysql from 'mysql2/promise';

/**
 * 用于保证数据库初始化完成
 * @param retries 尝试连接次数
 * @param delayMs 每次尝试连接的间隔时间
 */
export async function waitForDatabaseReady(
  retries = 10,
  delayMs = 1000,
) {
  for (let i = 0; i < retries; i++) {
    let conn: mysql.Connection | null = null;

    try {
      conn = await mysql.createConnection({
        host: env.DATABASE_HOST, // 强烈推荐 127.0.0.1
        user: env.DATABASE_USER,
        password: env.DATABASE_PASSWORD,
        database: env.DATABASE_NAME,
        connectTimeout: 3000,
      });
      // 最小但真实的检查，因为上面的连接并不能保证能够进行select，所以这里手动执行一次，让数据库能够完成初始化的全部过程
      await conn.query('SELECT 1');
      // 关闭连接
      await conn.end();

      console.log('🟢 Database is ready');
      return;
    }
    catch {
      console.log(`⏳ Waiting for database... (${i + 1})`);
      await new Promise(r => setTimeout(r, delayMs));
    }
    finally {
      if (conn) {
        try {
          await conn.end();
        }
        catch {}
      }
    }
  }

  console.error('❌ Database not ready after retries');
  process.exit(1);
}
