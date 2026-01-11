import type { LoginRequestDto } from '@/domain/dto';
import type { IAuthController, IAuthService } from '@/interface';
import { TYPES } from '@container/types';
import { Body, Controller, Post } from '@inversifyjs/http-core';
import { inject } from 'inversify';
import { LoginResponseDto } from '@/domain/dto';
import { formatResponse } from '@/utils';

@Controller('/api')
export class AuthController implements IAuthController {
  constructor(
    @inject(TYPES.AuthService) private readonly _authService: IAuthService,
  ) {}

  @Post('/login')
  async login(@Body() { username, password }: LoginRequestDto) {
    const data = await this._authService.login(username, password);
    return formatResponse(data, '登录成功！', LoginResponseDto);
  }
}
