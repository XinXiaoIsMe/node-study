import type { AvatarInfoModel, CanUpdateUserProfileModel, CreateUserParamModel, GetUserModel, UpdatedUserProfileModel, UserAvatarInfo } from '@model';

export interface IUserService {
  getCurrentUser: (userId: number) => Promise<GetUserModel>;
  updateUserProfile: (profile: CanUpdateUserProfileModel) => Promise<UpdatedUserProfileModel>;
  updateUserAvatar: (userId: number, avatarInfo: AvatarInfoModel) => Promise<UpdatedUserProfileModel>;
  getUserAvatar: (token: string, userId?: number) => Promise<UserAvatarInfo>;
  getUserList: () => Promise<GetUserModel[]>;
  createUser: (profile: CreateUserParamModel) => Promise<GetUserModel>;
  deleteUser: (userId: number) => Promise<boolean>;
}
