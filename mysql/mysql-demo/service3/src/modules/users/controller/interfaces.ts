import type { Request } from 'express';
import type { UpdateUserProfileDto, UpdateUserProfileResponse, UserProfileDto } from '../dto/user.dto';

export interface IUserController {
  getCurrentUser: (req: Request) => Promise<UserProfileDto | null>;
  updateCurrentUser: (req: Request, profile: UpdateUserProfileDto) => Promise<UpdateUserProfileResponse>;
}
