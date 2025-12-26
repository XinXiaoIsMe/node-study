import type { IUserRepository } from './interfaces';
import type { UserProfile } from './types';
import type { PrismaDb } from '@/prisma/client';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/common/ioc/common-types';

@injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @inject(TYPES.PrismaDb) private readonly db: PrismaDb,
  ) { }

  getUserProfileById(userId: number): Promise<UserProfile | null> {
    return this.db.prisma.user.findUnique({
      where: {
        id: userId,
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
        role: true,
      },
    });
  }
}
