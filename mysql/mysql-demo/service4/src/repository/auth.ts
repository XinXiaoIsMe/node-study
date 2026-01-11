import type { Prisma, User } from '@db/client';
import type { IAuthRepository } from '@/interface';
import type { PrismaDb } from '@/prisma/client';
import { inject } from 'inversify';
import { TYPES } from '@/container/types';

export class AuthRepository implements IAuthRepository {
  constructor(
    @inject(TYPES.PrismaDb) private readonly _db: PrismaDb,
  ) {}

  findByUsername(username: string): Promise<User | null>;
  findByUsername<S extends Prisma.UserSelect>(username: string, select: S): Promise<Prisma.UserGetPayload<{ select: S }> | null>;
  async findByUsername<S extends Prisma.UserSelect>(username: string, select?: S) {
    if (select) {
      return await this._db.prisma.user.findUnique({
        where: { username },
        select,
      });
    }

    return await this._db.prisma.user.findUnique({
      where: { username },
    });
  }
}
