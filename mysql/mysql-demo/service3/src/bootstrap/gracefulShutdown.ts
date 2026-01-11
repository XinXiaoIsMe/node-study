/* eslint-disable no-console */
import process from 'node:process';
import { prismaDb } from '@/prisma/instance';

export function setupGracefulShutdown() {
  const shutdown = async (signal: string) => {
    console.log(`🟡 Received ${signal}`);

    try {
      await prismaDb.disconnect();
      // tsx watch 下给一点时间
      await new Promise(r => setTimeout(r, 300));
    }
    finally {
      process.exit(0);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('SIGUSR2', shutdown); // nodemon / tsx 重载
  process.on('uncaughtException', async (err) => {
    console.error('🔥 Uncaught Exception', err);
    await shutdown('uncaughtException');
  });

  process.on('unhandledRejection', async (err) => {
    console.error('🔥 Unhandled Rejection', err);
    await shutdown('unhandledRejection');
  });
}
