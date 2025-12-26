import type { Container } from 'inversify';
import type { IUserRepository } from '../repository/interfaces';
import type { IUserService } from '../service/interfaces';
import { UserController } from '../controller';
import { UserRepository } from '../repository';
import { UserService } from '../service';
import { USER_TYPES } from '../types/ico-types';

export function bindUserModule(container: Container) {
  // controllers
  container.bind(UserController).toSelf();

  // services
  container.bind<IUserService>(USER_TYPES.UserService).to(UserService);

  // repositories
  container.bind<IUserRepository>(USER_TYPES.UserRepository).to(UserRepository);
}
