import type { Prisma, Role } from '@db/client';

export interface GetUserModel {
  userId: number;
  username: string;
  nickname: string | null;
  gender: number | null;
  role: Role;
  selfIntro: string | null;
  avatarMime: string | null;
  avatarSize: number | null;
  updateTime: Date | null;
}

export type GetUserProfile = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    nickname: true;
    gender: true;
    role: true;
    selfIntro: true;
    avatarMime: true;
    avatarSize: true;
    updateTime: true;
  };
}>;
