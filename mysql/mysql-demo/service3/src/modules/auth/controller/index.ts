import {
    Controller,
    Post,
    Body,
    ApplyMiddleware,
} from '@inversifyjs/http-core';
import { inject } from 'inversify';
import type { LoginRequestDto, LoginResponseDto } from '../dto/login.dto';
import type { IAuthService } from '../service/interfaces';
import type { IAuthController } from './interfaces';
import { AUTH_TYPES, AUTH_VALIDATORS } from '../types/ioc-types';

@Controller('/api')
export class AuthController implements IAuthController {
    constructor(
        @inject(AUTH_TYPES.AuthService)
        private readonly authService: IAuthService
    ) {}

    @ApplyMiddleware(AUTH_VALIDATORS.LoginValidator)
    @Post('/login')
    login(@Body() data: LoginRequestDto): Promise<LoginResponseDto> {
        return this.authService.login(data.username, data.password);
    }
}
