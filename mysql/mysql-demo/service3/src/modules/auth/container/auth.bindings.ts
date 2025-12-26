import type { Container } from 'inversify';
import type { IAuthRepository } from '../repository/interfaces';
import type { IAuthService } from '../service/interfaces';
import { AuthController } from '../controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { AuthRepository } from '../repository';
import { AuthService } from '../service';
import { AUTH_MIDDLEWARES, AUTH_TYPES } from '../types/ioc-types';
import { LoginValidator } from '../validator/login.validator';

export function bindAuthModule(container: Container) {
  // controllers
  container.bind(AuthController).toSelf();
  // services/repositorys
  container.bind<IAuthService>(AUTH_TYPES.AuthService).to(AuthService);
  container.bind<IAuthRepository>(AUTH_TYPES.AuthRepository).to(AuthRepository);
  // middlewares
  container.bind<LoginValidator>(AUTH_MIDDLEWARES.LoginValidator).to(LoginValidator);
  container.bind<AuthMiddleware>(AUTH_MIDDLEWARES.AuthMiddleware).to(AuthMiddleware);
}
