import type { IUserRepository } from '@/interface';
import type { PrismaDb } from '@/prisma/client';
import { inject } from 'inversify';
import { TYPES } from '@/container/types';

export class UserRepository implements IUserRepository {
  constructor(
    @inject(TYPES.PrismaDb) private readonly _db: PrismaDb,
  ) {}

  getUserById(userId: number) {
    return this._db.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        nickname: true,
        gender: true,
        role: true,
        selfIntro: true,
        avatarMime: true,
        avatarSize: true,
        updateTime: true,
      },
    });
  }
}
