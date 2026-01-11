import type { Request, Response } from 'express';
import type { CanUpdateUserProfileRequestDto, CreateUserRequestDto, DeleteUserDto, GetUserAvatarRequestDto, GetUserResponseDto, UpdateUserProfileResponseDto } from '@/domain/dto';
import type { ResponseData } from '@/types';

export interface IUserController {
  getCurrentUser: (req: Request) => Promise<ResponseData<GetUserResponseDto | null>>;
  updateUserProfile: (req: Request) => Promise<ResponseData<CanUpdateUserProfileRequestDto | null>>;
  updateUserAvatar: (req: Request) => Promise<ResponseData<UpdateUserProfileResponseDto | null>>;
  getUserAvatar: (params: GetUserAvatarRequestDto, res: Response) => Promise<void>;
  getUserList: () => Promise<ResponseData<GetUserResponseDto[] | null>>;
  createUser: (params: CreateUserRequestDto) => Promise<ResponseData<GetUserResponseDto | null>>;
  deleteUser: (query: DeleteUserDto) => Promise<ResponseData<null>>;
}
