import type { LoginRequestDto, LoginResponseDto } from '@dto';
import type { ResponseData } from '@/types';

export interface IAuthController {
  login: (params: LoginRequestDto) => Promise<ResponseData<LoginResponseDto>>;
}
