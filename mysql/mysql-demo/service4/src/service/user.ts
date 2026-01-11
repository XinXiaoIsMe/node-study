import type { IUserRepository, IUserService } from '@/interface';
import { inject } from 'inversify';
import { HttpError } from '@/common/errors';
import { TYPES } from '@/container/types';

export class UserService implements IUserService {
  constructor(
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository,
  ) {}

  async getCurrentUser(userId: number) {
    const data = await this._userRepo.getUserById(userId);
    if (!data) {
      throw new HttpError(200, {
        message: '用户不存在！',
      });
    }

    const {
      id,
      username,
      nickname,
      gender,
      role,
      selfIntro,
      avatarMime,
      avatarSize,
      updateTime,
    } = data;

    return {
      userId: id,
      username,
      nickname,
      gender,
      role,
      selfIntro,
      avatarMime,
      avatarSize,
      updateTime,
    };
  }
}
