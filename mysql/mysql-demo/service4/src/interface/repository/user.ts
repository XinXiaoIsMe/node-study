import type { Prisma, User } from '@db/client';

interface GetUserByIdFn {
  (userId: number): Promise<User | null>;
  <S extends Prisma.UserSelect>(userId: number, select: S): Promise<Prisma.UserGetPayload<{ select: S }> | null>;
}

interface GetUserByUsernameFn {
  (username: string): Promise<User | null>;
  <S extends Prisma.UserSelect>(username: string, select: S): Promise<Prisma.UserGetPayload<{ select: S }> | null>;
}
interface UpdateUserByIdFn {
  (userId: number, data: Prisma.UserUpdateInput): Promise<User | null>;
  <S extends Prisma.UserSelect>(userId: number, data: Prisma.UserUpdateInput, select: S): Promise<Prisma.UserGetPayload<{ select: S }> | null>;
}

interface GetUserListFn {
  (): Promise<User[]>;
  <S extends Prisma.UserSelect>(select: S): Promise<Array<Prisma.UserGetPayload<{ select: S }>>>;
}

type CreateUserFn = (profile: Prisma.UserCreateInput) => Promise<User | null>;

type DeleteUserFn = (userId: number) => Promise<User | null>;
export interface IUserRepository {
  getUserById: GetUserByIdFn;
  getUserByUsername: GetUserByUsernameFn;
  updateUserById: UpdateUserByIdFn;
  getUserList: GetUserListFn;
  createUser: CreateUserFn;
  deleteUserById: DeleteUserFn;
}
