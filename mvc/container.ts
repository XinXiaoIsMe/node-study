import { Container } from 'inversify';
import { PrismaDb } from './src/db';
import { MIDDLEWARES, TYPES } from './src/constants/types';
import { UserController } from './src/user/controller';
import { UserRepository } from './src/user/user.repository';
import { UserService } from './src/user/service';
import { IUserRepository, IUserService } from './src/user/types';
import { ValidateCreateUser } from './src/middlewares/validate-create-user.middleware';
import { ValidateUpdateUser } from './src/middlewares/validate-update-user.middleware';

const container = new Container();
container.bind<PrismaDb>(TYPES.PrismaDb).to(PrismaDb).inSingletonScope();
container.bind(UserController).toSelf();
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<IUserService>(TYPES.UserService).to(UserService);
container.bind(MIDDLEWARES.ValidateCreateUser).to(ValidateCreateUser).inSingletonScope();
container.bind(MIDDLEWARES.ValidateUpdateUser).to(ValidateUpdateUser).inSingletonScope();

export {
    container
}
