import SimpleContainer from './simple/container';
import { type UserController } from './simple/controller';
import { TYPES } from './simple/types';

// 不需要手動實例化類
const controller = SimpleContainer.get<UserController>(TYPES.UserController);
controller.showUsers();
