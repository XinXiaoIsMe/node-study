import type { Prisma, User } from '@db/client';

interface FindByUsernameFn {
  (username: string): Promise<User | null>;
  <S extends Prisma.UserSelect>(username: string, select: S): Promise<Prisma.UserGetPayload<{ select: S }> | null>;
}

export interface IAuthRepository {
  findByUsername: FindByUsernameFn;
}
