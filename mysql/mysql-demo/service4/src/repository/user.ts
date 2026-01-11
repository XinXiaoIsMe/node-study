import type { Prisma, User } from '@db/client';
import type { IUserRepository } from '@/interface';
import type { PrismaDb } from '@/prisma/client';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/container/types';

@injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @inject(TYPES.PrismaDb) private readonly _db: PrismaDb,
  ) {}

  getUserByUsername(username: string): Promise<User | null>;
  getUserByUsername<S extends Prisma.UserSelect>(username: string, select: S): Promise<Prisma.UserGetPayload<{ select: S }> | null>;
  async getUserByUsername<S extends Prisma.UserSelect>(username: string, select?: S) {
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

  getUserById(userId: number): Promise<User | null>;
  getUserById<S extends Prisma.UserSelect>(userId: number, select: S): Promise<Prisma.UserGetPayload<{ select: S }> | null>;
  async getUserById<S extends Prisma.UserSelect>(userId: number, select?: S) {
    if (select) {
      return await this._db.prisma.user.findUnique({
        where: { id: userId },
        select,
      });
    }

    return await this._db.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  updateUserById(userId: number, data: Prisma.UserUpdateInput): Promise<User>;
  updateUserById<S extends Prisma.UserSelect>(userId: number, data: Prisma.UserUpdateInput, select: S): Promise<Prisma.UserGetPayload<{ select: S }>>;
  async updateUserById<S extends Prisma.UserSelect>(
    userId: number,
    data: Prisma.UserUpdateInput,
    select?: S,
  ) {
    if (select) {
      return await this._db.prisma.user.update({
        where: { id: userId },
        data,
        select,
      });
    }

    return await this._db.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  getUserList(): Promise<User[]>;
  getUserList<S extends Prisma.UserSelect>(select: S): Promise<Array<Prisma.UserGetPayload<{ select: S }>>>;
  async getUserList<S extends Prisma.UserSelect>(select?: S) {
    if (select) {
      return await this._db.prisma.user.findMany({
        select,
      });
    }

    return await this._db.prisma.user.findMany();
  }

  createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this._db.prisma.user.create({
      data,
    });
  }

  deleteUserById(userId: number): Promise<User | null> {
    return this._db.prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }
}
