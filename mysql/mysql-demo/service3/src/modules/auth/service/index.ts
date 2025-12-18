import { injectable, inject } from 'inversify';
import bcrypt from 'bcryptjs';
import type { IAuthRepository } from '../repository/interfaces';
import type { IAuthService } from './interfaces';
import type { LoginResponseDto } from '../dto/login.dto';
import { AUTH_TYPES } from '../types/ioc-types';
import { BusinessError } from '../../../shared/errors';
import { getAvatarUpdatedTime, normalizeGender, normalizeRole } from '../../../shared/utils';
import { signAccessToken } from '../utils/jwt';

@injectable()
export class AuthService implements IAuthService {
    constructor(
        @inject(AUTH_TYPES.AuthRepository)
        private readonly authRepo: IAuthRepository
    ) {}

    async login(username: string, password: string): Promise<LoginResponseDto> {
        const user = await this.authRepo.findByUsernameForLogin(username);
        if (!user) {
            throw new BusinessError(200, '用户不存在！');
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            throw new BusinessError(200, '密码错误！');
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
            }
        };
    }
}