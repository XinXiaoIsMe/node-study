import type { Request as ExpressRequest } from 'express';
import type { IUserService } from '../service/interfaces';
import type { IUserController } from './interfaces';
import { Controller, Get, Request } from '@inversifyjs/http-core';
import { inject } from 'inversify';
import { USER_TYPES } from '../types/ico-types';

@Controller('api/users')
export class UserController implements IUserController {
  constructor(
    @inject(USER_TYPES.UserService) private readonly userService: IUserService,
  ) {}

  @Get('/me')
  getCurrentUser(@Request() req: ExpressRequest) {
    return this.userService.getUserProfile(req.user!.userId!);
  }
}
