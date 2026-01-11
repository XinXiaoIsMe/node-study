import type { IAuthRepository, IAuthService } from '@interface';
import bcrypt from 'bcryptjs';
import { inject, injectable } from 'inversify';
import { HttpError } from '@/common/errors';
import { TYPES } from '@/container/types';
import { loginUserProfileSelect } from '@/domain/model';
import { signAccessToken } from '@/utils';

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.AuthRepository) private readonly _authRepo: IAuthRepository,
  ) {}

  async login(username: string, password: string) {
    const user = await this._authRepo.findByUsername(username, loginUserProfileSelect);
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

    const token = signAccessToken(user.id, user.role);

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
