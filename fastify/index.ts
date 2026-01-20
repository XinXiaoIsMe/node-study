import type { FastifyInstance } from 'fastify';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import { closeMySqlPool, ensureTodoTable } from './db.js';
import { registerCorsMiddleware } from './middlewares.js';
import { registerTodoRoutes } from './routes.js';

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});

async function start(fastify: FastifyInstance) {
  try {
    await fastify.listen({
      port: 3000,
      host: '0.0.0.0',
    });
  }
  catch (e) {
    fastify.log.error(e);
    process.exit(1);
  }
}

async function bootstrap() {
  const fastify = Fastify({
    logger: true,
  });

  const dirnamePath = dirname(fileURLToPath(import.meta.url));
  const indexHtmlPath = join(dirnamePath, 'index.html');

  fastify.get('/', async (_request, reply) => {
    const html = await readFile(indexHtmlPath, 'utf8');
    reply.type('text/html; charset=utf-8').send(html);
  });

  fastify.get('/favicon.ico', async (_request, reply) => {
    reply.code(204).send();
  });

  registerCorsMiddleware(fastify, {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['content-type'],
  });

  registerTodoRoutes(fastify);

  fastify.addHook('onClose', async () => {
    await closeMySqlPool();
  });

  await ensureTodoTable();
  await start(fastify);
}
