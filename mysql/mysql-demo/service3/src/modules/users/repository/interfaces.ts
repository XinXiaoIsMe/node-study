import type { UpdateUserProfileDto } from '../dto/user.dto';
import type { AvatarInfo, UserProfile } from './types';

export interface IUserRepository {
  getUserProfileById: (userId: number) => Promise<UserProfile | null>;
  updateUserProfile: (userId: number, profile: UpdateUserProfileDto) => Promise<any>;
  updateUserAvatar: (userId: number, params: AvatarInfo) => Promise<any>;
}
