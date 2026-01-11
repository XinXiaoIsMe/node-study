import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import type { GetUserAvatarRequestDto } from '@/domain/dto';
import type { IUserController, IUserService } from '@/interface';
import { Buffer } from 'node:buffer';
import { ApplyMiddleware, Body, Controller, Delete, Get, Params, Post, Put, Query, Request, Response } from '@inversifyjs/http-core';
import { inject } from 'inversify';
import { TYPES } from '@/container/types';
import { CanUpdateUserProfileRequestDto, CreateUserRequestDto, DeleteUserDto, GetUserResponseDto, UpdateUserAvatarResponseDto, UpdateUserProfileRequestDto, UpdateUserProfileResponseDto } from '@/domain/dto';
import { formatResponse, toDto } from '@/utils';

@Controller('/api/users')
export class UserController implements IUserController {
  constructor(
    @inject(TYPES.UserService) private readonly _userService: IUserService,
  ) {}

  @ApplyMiddleware(TYPES.Auth)
  @Get('/me')
  async getCurrentUser(@Request() req: ExpressRequest) {
    const userId: number = req.user!.userId;
    const data = await this._userService.getCurrentUser(userId);
    return formatResponse(data, '获取用户信息成功！', GetUserResponseDto);
  }

  @ApplyMiddleware(TYPES.Auth)
  @Put('/me')
  async updateUserProfile(@Request() req: ExpressRequest) {
    const userId: number = req.user!.userId;
    const {
      nickname,
      gender,
      selfIntro,
    } = toDto(CanUpdateUserProfileRequestDto, req.body);
    const data = await this._userService.updateUserProfile({
      userId,
      nickname,
      gender,
      selfIntro,
    });
    return formatResponse(data, '更新用户信息成功！', CanUpdateUserProfileRequestDto);
  }

  @ApplyMiddleware(TYPES.Auth, TYPES.AvatarParser)
  @Post('/me/avatar')
  async updateUserAvatar(@Request() req: ExpressRequest) {
    const userId: number = req.user!.userId;
    const {
      mimetype,
      buffer,
      size,
    } = req.file!;
    const data = await this._userService.updateUserAvatar(userId, {
      file: buffer,
      size,
      mimetype,
    });
    return formatResponse(data, '更新用户头像成功！', UpdateUserAvatarResponseDto);
  }

  @Get('/me/avatar')
  async getUserAvatar(@Query() query: GetUserAvatarRequestDto, @Response() res: ExpressResponse) {
    const { token, userId } = query;
    const { avatar, avatarMime } = await this._userService.getUserAvatar(token, userId ? Number.parseInt(userId) : undefined);
    res
      .status(200)
      .type(avatarMime)
      .send(Buffer.isBuffer(avatar) ? avatar : Buffer.from(avatar));
  }

  @ApplyMiddleware(TYPES.AdminValidator)
  @ApplyMiddleware(TYPES.Auth)
  @Get('/')
  async getUserList() {
    const data = await this._userService.getUserList();
    return formatResponse(data, '获取所有用户信息成功！', GetUserResponseDto);
  }

  @ApplyMiddleware(TYPES.Auth)
  @Put('/')
  async updateUserById(@Body() data: UpdateUserProfileRequestDto) {
    const reqDto = toDto(UpdateUserProfileRequestDto, data);
    const updatedData = await this._userService.updateUserProfile(reqDto);
    return formatResponse(updatedData, '更新用户信息成功！', UpdateUserProfileResponseDto);
  }

  @ApplyMiddleware(TYPES.Auth)
  @Post('/')
  async createUser(@Body() profile: CreateUserRequestDto) {
    const userProfile = toDto(CreateUserRequestDto, profile);
    const data = await this._userService.createUser(userProfile);
    return formatResponse(data, '创建用户成功！', GetUserResponseDto);
  }

  @ApplyMiddleware(TYPES.Auth)
  @Delete('/:userId')
  async deleteUser(@Params() params: DeleteUserDto) {
    const { userId } = toDto(DeleteUserDto, params);
    await this._userService.deleteUser(Number.parseInt(userId));
    return formatResponse(null, '删除用户成功！');
  }
}
