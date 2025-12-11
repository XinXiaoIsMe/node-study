import { Container } from "inversify";
import { TYPES } from "./types";
import { UserRepository } from "./repository";
import { UserService } from './service';
import { UserController } from "./controller";

const container = new Container();
// 綁定依賴
container.bind(TYPES.UserRepository).to(UserRepository);
container.bind(TYPES.UserService).to(UserService);
container.bind(TYPES.UserController).to(UserController);

export default container;
