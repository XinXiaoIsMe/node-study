import type { LoginResponseDto } from '../dto/login.dto';
import type { IAuthRepository } from '../repository/interfaces';
import type { IAuthService } from './interfaces';
import { UnauthorizedError } from '@shared/errors';
import bcrypt from 'bcryptjs';
import { inject, injectable } from 'inversify';
import { getAvatarUpdatedTime, normalizeGender, normalizeRole } from '../../../shared/utils';
import { AUTH_TYPES } from '../types/ioc-types';
import { signAccessToken } from '../utils/jwt';

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(AUTH_TYPES.AuthRepository)
    private readonly authRepo: IAuthRepository,
  ) {}

  async login(username: string, password: string): Promise<LoginResponseDto> {
    const user = await this.authRepo.findByUsernameForLogin(username);
    if (!user) {
      throw new UnauthorizedError({
        message: '用户不存在！',
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new UnauthorizedError({
        message: '密码错误！',
      });
    }

    const token = signAccessToken(user.id);

    return {
      token,
      message: '登录成功',
      user: {
        avatarUpdatedAt: getAvatarUpdatedTime(user),
        userId: user.id,
        username: user.username,
        nickname: user.nickname,
        gender: normalizeGender(user.gender),
        selfIntro: user.selfIntro ?? null,
        role: normalizeRole(user.role),
      },
    };
  }
}
