import { Container } from 'inversify';
import { bindCommon } from './common/container/common.bindings';
import { bindAuthModule } from './modules/auth/container/auth.bindings';
import { bindUserModule } from './modules/users/container/users.binding';

const container = new Container();

// 公共依赖
bindCommon(container);

// 业务模块依赖
bindAuthModule(container);
bindUserModule(container);

export {
  container,
};
