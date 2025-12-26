import { injectable } from 'inversify';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client';
import { env } from '@config/env';

@injectable()
export class PrismaDb {
    prisma: PrismaClient;
    constructor() {
        const adapter = new PrismaMariaDb({
            host: env.DATABASE_HOST,
            user: env.DATABASE_USER,
            password: env.DATABASE_PASSWORD,
            database: env.DATABASE_NAME,
            connectionLimit: 5
        });
        this.prisma = new PrismaClient({ adapter });
    }
}
