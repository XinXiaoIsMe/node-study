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

export const userProfileSelect = {
  id: true,
  username: true,
  nickname: true,
  gender: true,
  role: true,
  selfIntro: true,
  avatarMime: true,
  avatarSize: true,
  updateTime: true,
} satisfies Prisma.UserSelect;

export type GetUserProfile = Prisma.UserGetPayload<{
  select: typeof userProfileSelect;
}>;

export interface CanUpdateUserProfileModel {
  userId: number;
  gender?: number | null;
  nickname?: string | null;
  selfIntro?: string | null;
}

export interface UpdatedUserProfileModel {
  userId: number;
  username: string;
  nickname: string | null;
  gender: number | null;
  role: Role;
  selfIntro: string | null;
  updateTime: Date | null;
}

export const updatedUserProfileSelect = {
  id: true,
  username: true,
  nickname: true,
  gender: true,
  role: true,
  selfIntro: true,
  updateTime: true,
} satisfies Prisma.UserSelect;

export type UpdatedUserProfile = Prisma.UserGetPayload<{
  select: typeof updatedUserProfileSelect;
}>;

export interface AvatarInfoModel {
  file: Uint8Array;
  mimetype: string;
  size: number;
}

export const userAvatarInfoSelect = {
  avatar: true,
  avatarMime: true,
  avatarSize: true,
} satisfies Prisma.UserSelect;

export type UserAvatarInfoModel = Prisma.UserGetPayload<{
  select: typeof userAvatarInfoSelect;
}>;

export interface UserAvatarInfo {
  avatar: Uint8Array;
  avatarMime: string;
}

export interface CreateUserParamModel {
  username: string;
  password: string;
  nickname?: string | null;
  gender?: number | null;
  role?: Role;
  selfIntro?: string | null;
  avatar?: string | null;
  avatarMime?: string | null;
  avatarSize?: number | null;
}
