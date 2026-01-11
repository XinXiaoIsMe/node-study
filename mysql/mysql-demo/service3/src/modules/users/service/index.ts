import type { UpdateUserProfileDto } from '../dto/user.dto';
import type { UpdateUserProfileModel, UserProfileModel } from '../models/user.vo';
import type { IUserRepository } from '../repository/interfaces';
import type { IUserService, UpdateUserAvatarParams } from './interfaces';
import { getAvatarUpdatedTime } from '@shared/utils';
import { inject, injectable } from 'inversify';
import sharp from 'sharp';
import { BadRequestError } from '@/common/errors';
import { USER_TYPES } from '../types/ico-types';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(USER_TYPES.UserRepository) private readonly userRepo: IUserRepository,
  ) { }

  async getUserProfile(userId: number): Promise<UserProfileModel | null> {
    const user = await this.userRepo.getUserProfileById(userId);
    if (!user)
      return user;

    return {
      profile: {
        userId: user.id,
        username: user.username,
        nickname: user.nickname,
        gender: user.gender,
        role: user.role,
        selfIntro: user.selfIntro,
        avatarUpdatedAt: getAvatarUpdatedTime(user),
      },
    };
  }

  async updateUserProfile(userId: number, profile: UpdateUserProfileDto): Promise<UpdateUserProfileModel> {
    if (Object.keys(profile).length === 0) {
      throw new BadRequestError({
        message: '没有可更新的字段',
      });
    }

    const user = await this.userRepo.updateUserProfile(userId, profile);
    return {
      profile: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        gender: user.gender,
        selfIntro: user.selfIntro,
        role: user.role,
        avatarUpdatedAt: getAvatarUpdatedTime(user),
      },
    };
  }

  async updateUserAvatar(userId: number, avatarInfo: UpdateUserAvatarParams) {
    const compressed = await sharp(avatarInfo.avatar)
      .rotate()
      .resize(320, 320, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();

    const {
      id,
      username,
      nickname,
      gender,
      selfIntro,
      role,
      avatarSize,
      updateTime,
    } = this.userRepo.updateUserAvatar(userId, {
      avatar: compressed,
      avatarMime: avatarInfo.avatarMime,
      avatarSize: avatarInfo.avatarSize,
    });
    return {
      id,
      username,
      nickname,
      gender,
      selfIntro,
      role,
      avatarSize,
      avatarUpdatedAt: updateTime,
    };
  }
}
