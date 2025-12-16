import { inject, injectable } from 'inversify';
import type { IAuthRepository } from './types/interfaces';
import type { PrismaDb } from '../../prisma/client';
import { TYPES } from '../../common/ioc/common-types';

@injectable()
export class AuthRepository implements IAuthRepository {
    constructor(
        @inject(TYPES.PrismaDb)
        private readonly db: PrismaDb
    ) {}

    findOne(username: string) {
        return this.db.prisma.user.findUnique({
            where: {
                username
            }
        });
    }
}