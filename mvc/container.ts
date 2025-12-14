import { Container } from 'inversify';
import { PrismaDb } from './src/db';
import { MIDDLEWARES, TYPES } from './src/constants/types';
import { UserController } from './src/user/controller';
import { UserRepository } from './src/user/user.repository';
import { UserService } from './src/user/service';
import { IUserRepository, IUserService } from './src/user/types';
import { ValidateCreateUser } from './src/middlewares/validate-create-user.middleware';
import { ValidateUpdateUser } from './src/middlewares/validate-update-user.middleware';
import { PostController } from './src/post/controller';
import { IPostRepository, IPostService } from './src/post/types';
import { PostRepository } from './src/post/post.repository';
import { PostService } from './src/post/service';

const container = new Container();

// database
container.bind<PrismaDb>(TYPES.PrismaDb).to(PrismaDb).inSingletonScope();

// container
container.bind(UserController).toSelf();
container.bind(PostController).toSelf();

// service/repository
// user
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<IUserService>(TYPES.UserService).to(UserService);
// post
container.bind<IPostRepository>(TYPES.PostRepository).to(PostRepository);
container.bind<IPostService>(TYPES.PostService).to(PostService);

// validator
// user
container.bind(MIDDLEWARES.ValidateCreateUser).to(ValidateCreateUser).inSingletonScope();
container.bind(MIDDLEWARES.ValidateUpdateUser).to(ValidateUpdateUser).inSingletonScope();

export {
    container
}
