import type { UserProfileDto } from '../dto/user.dto';
import type { IUserRepository } from '../repository/interfaces';
import type { IUserService } from './interfaces';
import { getAvatarUpdatedTime } from '@shared/utils';
import { inject, injectable } from 'inversify';
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
}
