import type { UpdateUserProfileDto, UpdateUserProfileResponse, UserProfileDto } from '../dto/user.dto';
import type { IUserRepository } from '../repository/interfaces';
import type { IUserService } from './interfaces';
import { getAvatarUpdatedTime } from '@shared/utils';
import { inject, injectable } from 'inversify';
import { BadRequestError } from '@/shared/errors';
import { USER_TYPES } from '../types/ico-types';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(USER_TYPES.UserRepository) private readonly userRepo: IUserRepository,
  ) {}

  async getUserProfile(userId: number): Promise<UserProfileDto | null> {
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

  async updateUserProfile(userId: number, profile: UpdateUserProfileDto): Promise<UpdateUserProfileResponse> {
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
}
