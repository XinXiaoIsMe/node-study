import type { IAuthRepository } from '@/interface';
import type { PrismaDb } from '@/prisma/client';
import { inject } from 'inversify';
import { TYPES } from '@/container/types';

export class AuthRepository implements IAuthRepository {
  constructor(
    @inject(TYPES.PrismaDb) private readonly _db: PrismaDb,
  ) {}

  findByUsername(username: string) {
    return this._db.prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        username: true,
        password: true,
        nickname: true,
        gender: true,
        role: true,
        selfIntro: true,
      },
    });
  }
}
