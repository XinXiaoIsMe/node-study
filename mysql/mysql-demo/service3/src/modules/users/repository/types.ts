import type { Prisma } from '@db/client';

export type UserProfile = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    nickname: true;
    updateTime: true;
    avatarSize: true;
    gender: true;
    selfIntro: true;
    role: true;
  };
}>;

export interface AvatarInfo {
  avatar: Uint8Array;
  avatarMime: string;
  avatarSize: number;
}

export type UpdateAvatarReturnType = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    nickname: true;
    updateTime: true;
    avatarSize: true;
    gender: true;
    selfIntro: true;
    role: true;
  };
}>;
