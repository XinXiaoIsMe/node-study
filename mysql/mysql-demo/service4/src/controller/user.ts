import type { Request as ExpressRequest } from 'express';
import type { IUserController, IUserService } from '@/interface';
import { ApplyMiddleware, Controller, Get, Request } from '@inversifyjs/http-core';
import { inject } from 'inversify';
import { TYPES } from '@/container/types';
import { GetUserResponseDto } from '@/domain/dto';
import { formatResponse } from '@/utils';

@Controller('/api/users')
export class UserController implements IUserController {
  constructor(
    @inject(TYPES.UserService) private readonly _userService: IUserService,
  ) {}

  @ApplyMiddleware(TYPES.Auth)
  @Get('/me')
  async getCurrentUser(@Request() req: ExpressRequest) {
    const userId: number = req.user!.userId!;
    const data = await this._userService.getCurrentUser(userId);
    return formatResponse(data, '获取用户信息成功！', GetUserResponseDto);
  }
}
