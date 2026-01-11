import type { IAuthRepository, IAuthService, IRefreshTokenRepository, ITaskRepository, ITaskService, IUserRepository, IUserService } from '@/interface';

import type { PrismaDb } from '@/prisma/client';
import { Container } from 'inversify';
import { AuthController, TaskController, UserController } from '@/controller';
import { GlobalErrorFilter } from '@/filter';
import { AdminValidatorMiddleware, AuthMiddleware, AvatarParserMiddle, CorsMiddleware } from '@/middleware';
import { prismaDb } from '@/prisma/instance';
import { AuthRepository, TaskRepository, UserRepository } from '@/repository';
import { RefreshTokenRepository } from '@/repository/token';
import { AuthService, TaskService, UserService } from '@/service';
import { TYPES } from './types';

const container = new Container();
bindContainer(container);

function bindContainer(container: Container) {
  // database
  container.bind<PrismaDb>(TYPES.PrismaDb).toConstantValue(prismaDb);

  // middlewares
  container.bind<CorsMiddleware>(TYPES.Cors).to(CorsMiddleware).inSingletonScope();
  container.bind<AuthMiddleware>(TYPES.Auth).to(AuthMiddleware).inSingletonScope();
  container.bind<AdminValidatorMiddleware>(TYPES.AdminValidator).to(AdminValidatorMiddleware).inSingletonScope();
  container.bind<AvatarParserMiddle>(TYPES.AvatarParser).to(AvatarParserMiddle).inSingletonScope();

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

  // task
  container.bind(TaskController).toSelf();
  container.bind<ITaskService>(TYPES.TaskService).to(TaskService);
  container.bind<ITaskRepository>(TYPES.TaskRepository).to(TaskRepository);
}

export {
  container,
};
