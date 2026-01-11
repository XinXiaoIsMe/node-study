import type { Request as ExpressRequest } from 'express';
import type { UpdateUserProfileDto } from '../dto/user.dto';
import type { IUserService } from '../service/interfaces';
import type { IUserController } from './interfaces';
import { ApplyMiddleware, Body, Controller, Get, Post, Put, Request } from '@inversifyjs/http-core';
import { inject } from 'inversify';
import { BaseController } from '@/common/controller/BaseController';
import { USER_MIDDLEWARES, USER_TYPES } from '../types/ico-types';

@Controller('api/users')
export class UserController extends BaseController implements IUserController {
  constructor(
    @inject(USER_TYPES.UserService) private readonly userService: IUserService,
  ) {
    super();
  }

  @Get('/me')
  getCurrentUser(@Request() req: ExpressRequest) {
    return this.userService.getUserProfile(req.user!.userId!);
  }

  @Put('/me')
  updateCurrentUser(@Request() req: ExpressRequest, @Body() profile: UpdateUserProfileDto) {
    return this.userService.updateUserProfile(req.user!.userId!, profile);
  }

  @ApplyMiddleware(USER_MIDDLEWARES.AvatarMiddleware)
  @Post('/me/avatar')
  async updateUserAvatar(@Request() req: ExpressRequest) {
    const profile = await this.userService.updateUserAvatar(req.user!.userId!, {
      avatar: req.file!.buffer,
      avatarMime: req.file!.mimetype,
      avatarSize: req.file!.size,
    });
    return this.ok(profile, '头像已更新');
  }
}
