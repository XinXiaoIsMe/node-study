import type { UserProfileDto } from '../dto/user.dto';

export interface IUserService {
  getUserProfile: (userId: number) => Promise<UserProfileDto | null>;
}
