import type { IAuthRepository, IAuthService, IRefreshTokenRepository, IUserRepository, IUserService } from '@/interface';
import { Container } from 'inversify';
import { AuthController, UserController } from '@/controller';
import { GlobalErrorFilter } from '@/filter';
import { AuthMiddleware } from '@/middleware/auth';
import { CorsMiddleware } from '@/middleware/cors';
import { prismaDb } from '@/prisma/instance';
import { AuthRepository, UserRepository } from '@/repository';
import { RefreshTokenRepository } from '@/repository/token';
import { AuthService, UserService } from '@/service';
import { TYPES } from './types';

const container = new Container();
bindContainer(container);

function bindContainer(container: Container) {
  container.bind(TYPES.PrismaDb).toConstantValue(prismaDb);
  container.bind(TYPES.Cors).to(CorsMiddleware).inSingletonScope();
  container.bind(TYPES.Auth).to(AuthMiddleware).inSingletonScope();

  // filters
  container.bind<GlobalErrorFilter>(GlobalErrorFilter).toSelf();

  // auth
  container.bind(AuthController).toSelf();
  container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
  container.bind<IAuthRepository>(TYPES.AuthRepository).to(AuthRepository);
  container.bind<IRefreshTokenRepository>(TYPES.RefreshTokenRepository).to(RefreshTokenRepository);

  // user
  container.bind(UserController).toSelf();
  container.bind<IUserService>(TYPES.UserService).to(UserService);
  container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
}

export {
  container,
};
