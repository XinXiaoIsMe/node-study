import type { Prisma } from '@prisma/client';

export type UserProfile = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    nickname: true;
    password: true;
    updateTime: true;
    avatarSize: true;
    gender: true;
    selfIntro: true;
    role: true;
  };
}>;
