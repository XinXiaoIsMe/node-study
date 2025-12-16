import { injectable } from 'inversify';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client';

@injectable()
export class PrismaDb {
    prisma: PrismaClient;
    constructor() {
        const adapter = new PrismaMariaDb({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            connectionLimit: 5
        });
        this.prisma = new PrismaClient({ adapter });
    }
}
