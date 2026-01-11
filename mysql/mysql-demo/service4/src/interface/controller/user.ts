import type { Request } from 'express';
import type { GetUserResponseDto } from '@/domain/dto';
import type { ResponseData } from '@/types';

export interface IUserController {
  getCurrentUser: (req: Request) => Promise<ResponseData<GetUserResponseDto | null>>;
}
