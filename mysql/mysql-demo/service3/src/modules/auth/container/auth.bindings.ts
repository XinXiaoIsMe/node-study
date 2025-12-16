import { Container } from 'inversify';
import { AuthController } from '../controller';
import { AuthService } from '../service';
import { AuthRepository } from '../repository';
import type { IAuthService, IAuthRepository } from '../types/interfaces';
import { AUTH_TYPES, AUTH_VALIDATORS } from '../types/ioc-types';
import { LoginValidator } from '../validator/login.validator';

export function bindAuthModule(container: Container) {
    // controllers
    container.bind(AuthController).toSelf();
    // services/repositorys
    container.bind<IAuthService>(AUTH_TYPES.AuthService).to(AuthService);
    container.bind<IAuthRepository>(AUTH_TYPES.AuthRepository).to(AuthRepository);
    // middlewares
    container.bind<LoginValidator>(AUTH_VALIDATORS.LoginValidator).to(LoginValidator);
}
