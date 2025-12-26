import type { LoginRequestDto, LoginResponseDto } from '../dto/login.dto';
import type { IAuthService } from '../service/interfaces';
import type { IAuthController } from './interfaces';
import {
  ApplyMiddleware,
  Body,
  Controller,
  Post,
} from '@inversifyjs/http-core';
import { inject } from 'inversify';
import { AUTH_MIDDLEWARES, AUTH_TYPES } from '../types/ioc-types';

@Controller('/api')
export class AuthController implements IAuthController {
  constructor(
    @inject(AUTH_TYPES.AuthService)
    private readonly authService: IAuthService,
  ) {}

  @ApplyMiddleware(AUTH_MIDDLEWARES.LoginValidator)
  @Post('/login')
  login(@Body() data: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(data.username, data.password);
  }
}
