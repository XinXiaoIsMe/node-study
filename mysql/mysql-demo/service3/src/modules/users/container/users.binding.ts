import type { Container } from 'inversify';
import type { IUserRepository } from '../repository/interfaces';
import type { IUserService } from '../service/interfaces';
import { UserController } from '../controller';
import { AvatarMiddleware } from '../middleware/avatar.middleware';
import { UserRepository } from '../repository';
import { UserService } from '../service';
import { USER_MIDDLEWARES, USER_TYPES } from '../types/ico-types';
import { UpdateAvatarValidator } from '../validator/update-avatar';

export function bindUserModule(container: Container) {
  // controllers
  container.bind(UserController).toSelf();

  // services
  container.bind<IUserService>(USER_TYPES.UserService).to(UserService);

  // repositories
  container.bind<IUserRepository>(USER_TYPES.UserRepository).to(UserRepository);

  // middlewares
  container.bind<AvatarMiddleware>(USER_MIDDLEWARES.AvatarMiddleware).to(AvatarMiddleware);
  container.bind<UpdateAvatarValidator>(USER_MIDDLEWARES.UpdateAvatarValidator).to(UpdateAvatarValidator);
}
