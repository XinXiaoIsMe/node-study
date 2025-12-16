import { injectable, inject } from 'inversify';
import type { LoginDto } from './dto/login.dto';
import type { IAuthRepository, IAuthService } from './types/interfaces';
import { AUTH_TYPES } from './types/ioc-types';

@injectable()
export class AuthService implements IAuthService {
    constructor(
        @inject(AUTH_TYPES.AuthRepository)
        private readonly authRepo: IAuthRepository
    ) {}

    login(data: LoginDto): Promise<any> {
        return this.authRepo.findOne(data.username);
    }
}