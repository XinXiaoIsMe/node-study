import type { Buffer } from 'node:buffer';
import type { UpdateUserProfileDto } from '../dto/user.dto';
import type { UpdateUserAvatarModel, UpdateUserProfileModel, UserProfileModel } from '../models/user.vo';

export interface IUserService {
  getUserProfile: (userId: number) => Promise<UserProfileModel | null>;
  updateUserProfile: (userId: number, profile: UpdateUserProfileDto) => Promise<UpdateUserProfileModel>;
  updateUserAvatar: (userId: number, avatarInfo: UpdateUserAvatarParams) => Promise<UpdateUserAvatarModel>;
}

export interface UpdateUserAvatarParams {
  avatar: Buffer;
  avatarMime: string;
  avatarSize: number;
}
