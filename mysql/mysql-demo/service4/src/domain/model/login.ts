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

export type LoginUserProfile = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    password: true;
    nickname: true;
    gender: true;
    role: true;
    selfIntro: true;
  };
}>;
