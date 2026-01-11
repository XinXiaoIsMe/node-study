import type { IRefreshTokenRepository } from '@interface';
import type { TokenProfile } from '@/domain/model';
import type { PrismaDb } from '@/prisma/client';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/container/types';

@injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @inject(TYPES.PrismaDb) private readonly _db: PrismaDb,
  ) {}

  create(data: TokenProfile) {
    return this._db.prisma.refreshToken.create({
      data: {
        ...data,
        revoked: false,
      },
    });
  }

  revoke(token: string) {
    return this._db.prisma.refreshToken.update({
      where: { token },
      data: { revoked: true },
    });
  }
}
