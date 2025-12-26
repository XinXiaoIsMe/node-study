import type { Role } from '@prisma/client';

export interface UserProfileDto {
  profile: {
    avatarUpdatedAt: string | null;
    userId: number;
    username: string;
    nickname: string | null;
    gender: number | null;
    role: Role;
    selfIntro: string | null;
  };
}

export interface UpdateUserProfileDto {
  nickname?: string | null;
  gender?: number | null;
  selfIntro?: string | null;
}

export interface UpdateUserProfileResponse {
  profile: {
    id: string;
    username: string;
    nickname?: string | null;
    gender: number | null;
    selfIntro: string | null;
    role: Role;
    avatarUpdatedAt: string | null;
  };
}
