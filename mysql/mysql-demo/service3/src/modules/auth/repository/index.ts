import { inject, injectable } from 'inversify';
import type { IAuthRepository } from './interfaces';
import type { UserForLogin } from './types';
import type { PrismaDb } from '../../../prisma/client';
import { TYPES } from '../../../common/ioc/common-types';

@injectable()
export class AuthRepository implements IAuthRepository {
    constructor(
        @inject(TYPES.PrismaDb)
        private readonly db: PrismaDb
    ) {}

    findByUsernameForLogin(username: string): Promise<UserForLogin | null> {
        return this.db.prisma.user.findUnique({
            where: {
                username
            },
            select: {
                id: true,
                username: true,
                nickname: true,
                password: true,
                updateTime: true,
                avatarSize: true,
                gender: true,
                selfIntro: true,
                role: true
            }
        });
    }
}