import type { Request as ExpressRequest } from 'express';
import type { UpdateUserProfileDto } from '../dto/user.dto';
import type { IUserService } from '../service/interfaces';
import type { IUserController } from './interfaces';
import { Body, Controller, Get, Put, Request } from '@inversifyjs/http-core';
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

  @Put('/me')
  updateCurrentUser(@Request() req: ExpressRequest, @Body() profile: UpdateUserProfileDto) {
    return this.userService.updateUserProfile(req.user!.userId!, profile);
  }
}
