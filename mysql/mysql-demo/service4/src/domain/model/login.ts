import type { Prisma, Role } from '@db/client';

export interface UserProfile {
  userId: number;
  username: string;
  nickname: string | null;
  gender: number | null;
  role: Role;
  selfIntro: string | null;
}

export interface LoginModel {
  token: string;
  user: UserProfile;
}

export const loginUserProfileSelect = {
  id: true,
  username: true,
  password: true,
  nickname: true,
  gender: true,
  role: true,
  selfIntro: true,
} satisfies Prisma.UserSelect;

export type LoginUserProfile = Prisma.UserGetPayload<{
  select: typeof loginUserProfileSelect;
}>;
