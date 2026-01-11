import type { Role } from '@db/browser';

export interface UserProfileModel {
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

export interface UpdateUserAvatarModel {
  id: string;
  username: string;
  nickname?: string | null;
  gender: number | null;
  selfIntro: string | null;
  role: Role;
  avatarSize: number;
  avatarUpdatedAt: string | null;
}
