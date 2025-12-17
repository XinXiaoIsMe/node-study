import { injectable, inject } from 'inversify';
import bcrypt from 'bcryptjs';
import type { IAuthRepository, IAuthService } from './types/interfaces';
import { AUTH_TYPES } from './types/ioc-types';
import { BusinessError } from '../../shared/errors';

@injectable()
export class AuthService implements IAuthService {
    constructor(
        @inject(AUTH_TYPES.AuthRepository)
        private readonly authRepo: IAuthRepository
    ) {}

    async login(username: string, password: string): Promise<any> {
        const user = await this.authRepo.findByUsername(username);
        if (!user) {
            throw new BusinessError(200, '用户不存在！');
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            throw new BusinessError(200, '密码错误！');
        }

        return user;
    }
}