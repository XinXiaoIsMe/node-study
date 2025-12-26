import type { UpdateUserProfileDto, UpdateUserProfileResponse, UserProfileDto } from '../dto/user.dto';

export interface IUserService {
  getUserProfile: (userId: number) => Promise<UserProfileDto | null>;
  updateUserProfile: (userId: number, profile: UpdateUserProfileDto) => Promise<UpdateUserProfileResponse>;
}
