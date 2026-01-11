import type { SuccessResponse } from '@shared/types/response';
import type { Request } from 'express';
import type { UpdateUserProfileDto, UpdateUserProfileResponse } from '../dto/user.dto';
import type { UserProfileModel } from '../models/user.vo';

export interface IUserController {
  getCurrentUser: (req: Request) => Promise<UserProfileModel | null>;
  updateCurrentUser: (req: Request, profile: UpdateUserProfileDto) => Promise<UpdateUserProfileResponse>;
  updateUserAvatar: (req: Request) => SuccessResponse<any>;
}
