/* eslint-disable no-console */
import { env } from '@config/env';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client';

export class PrismaDb {
  readonly prisma: PrismaClient;
  private connected = false;
  constructor() {
    const adapter = new PrismaMariaDb({
      host: env.DATABASE_HOST,
      user: env.DATABASE_USER,
      password: env.DATABASE_PASSWORD,
      database: env.DATABASE_NAME,
      connectionLimit: env.NODE_ENV === 'development' ? 1 : 5,
    });
    this.prisma = new PrismaClient({ adapter });
  }

  /** 启动阶段显式调用 */
  async connect() {
    if (this.connected)
      return;

    await this.prisma.$connect();
    this.connected = true;

    console.log('🟢 Prisma connected');
  }

  /** 关闭阶段显式调用（tsx / SIGTERM） */
  async disconnect() {
    if (!this.connected)
      return;

    console.log('🟡 Prisma disconnecting...');
    await this.prisma.$disconnect();
    this.connected = false;
    console.log('🟢 Prisma disconnected');
  }
}
