import type { Knex } from 'knex';
import process from 'node:process';
import express from 'express';
import knex from 'knex';
import { nanoid } from 'nanoid';

let db: Knex | undefined;

const dbName = 'short_link';
const tableName = 'short_link';

// 简单 demo：连接信息直接写死（按你本地 MySQL 修改）
const connectionBase = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Wulinxiang133#',
};

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});

async function bootstrap() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  await setupKnex();
  useRouter(app);

  app.listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log('Server is running on port 3000');
  });
}

function useRouter(app: express.Application) {
  const router = express.Router();
  // 生成短链接并存放到数据库
  router.post('/create_url', async (req, res) => {
    if (!db) {
      return res.status(400).json({ message: 'database error' });
    }

    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }
    const shortUrl = nanoid(6);
    await db(tableName).insert({
      url,
      short_id: shortUrl,
    });
    return res.status(200).json({ data: shortUrl, message: 'success' });
  });

  // 根据短链接查看对应原始链接，并跳转到原始链接
  router.get('/:shortUrl', async (req, res) => {
    if (!db) {
      return res.status(400).json({ message: 'database error' });
    }

    const shortUrl = req.params.shortUrl;
    if (!shortUrl) {
      return res.status(400).json({ message: 'shortUrl is required' });
    }

    const result = await db(tableName).select('url').where('short_id', shortUrl);
    if (result && result[0]) {
      res.redirect(result[0].url);
    }
    else {
      res.send('Url not found');
    }
  });
  app.use('/api', router);
}

async function setupKnex() {
  if (db)
    return;

  // 避免连接配置对象被第三方库意外改写：每次使用都 clone 一份
  const serverConnection = { ...connectionBase };
  const appConnection = { ...connectionBase, database: dbName };

  // 先用不指定 database 的连接创建库，否则库不存在时会直接报 Unknown database
  const serverDb = knex({
    client: 'mysql2',
    connection: serverConnection,
  });

  try {
    await ensureDatabaseExists(serverDb);
  }
  finally {
    await serverDb.destroy();
  }

  db = knex({
    client: 'mysql2',
    connection: appConnection,
  });

  await ensureTableExists(db);
}

async function ensureDatabaseExists(serverDb: Knex) {
  await serverDb.raw(
    'CREATE DATABASE IF NOT EXISTS ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci',
    [dbName],
  );
}

async function ensureTableExists(db: Knex) {
  const exists = await db.schema.hasTable(tableName);
  if (exists)
    return;

  await db.schema.createTable(tableName, (table) => {
    table.increments('id').primary().comment('Primary Key');
    table.string('short_id', 255).notNullable().comment('短码');
    table.string('url', 255).notNullable().comment('网址');
  });
}
