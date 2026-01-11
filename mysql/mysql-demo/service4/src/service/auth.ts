import type { IAuthRepository, IAuthService, IRefreshTokenRepository } from '@interface';
import bcrypt from 'bcryptjs';
import { inject } from 'inversify';
import { HttpError } from '@/common/errors';
import { TYPES } from '@/container/types';
import { signAccessToken } from '@/utils';

export * from './auth';

export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.AuthRepository) private readonly _authRepo: IAuthRepository,
    @inject(TYPES.RefreshTokenRepository) private readonly _refreshTokenRepo: IRefreshTokenRepository,
  ) {}

  async login(username: string, password: string) {
    const user = await this._authRepo.findByUsername(username);
    if (!user) {
      throw new HttpError(200, {
        code: 0,
        message: '用户不存在！',
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new HttpError(200, {
        code: 0,
        message: '密码错误！',
      });
    }

    const token = signAccessToken(user.id);

    return {
      token,
      user: {
        userId: user.id,
        username: user.username,
        nickname: user.nickname,
        gender: user.gender,
        selfIntro: user.selfIntro,
        role: user.role,
      },
    };
  }
}
