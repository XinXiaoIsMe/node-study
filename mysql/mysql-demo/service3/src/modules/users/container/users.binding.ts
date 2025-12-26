import type { Container } from 'inversify';
import { UserController } from '../controller';

export function bindUserModule(container: Container) {
  // controllers
  container.bind(UserController).toSelf();
}
