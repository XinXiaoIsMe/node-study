/* eslint-disable perfectionist/sort-imports */
import 'dotenv/config';
import { env } from '@config/env';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { AUTH_MIDDLEWARES } from '@/modules/auth/types/ioc-types';
import { GlobalErrorFilter } from './common/filter/error.filter';
import { MIDDLEWARES } from './common/ioc/common-types';
import { CorsMiddleware } from './common/middleware/cors.middleware';
import { container } from './container';
import { waitForDatabaseReady } from './bootstrap/waitForDatabaseReady';
import { setupGracefulShutdown } from './bootstrap/gracefulShutdown';

async function bootstrap() {
  setupGracefulShutdown();
  // 确保启动应用前数据库初始化完成（必须先执行，否则的话，就需要手动使用mysql -u root -p命令手动登录账号，不然后续prisma连接数据库就会失败：pool timeout: failed to retrieve a connection from pool after 10000ms）
  // 由于mysql启动后，里面部分运行期组件是惰性加载的，而prisma要求连接池完全可用，所以会失败
  // 当手动登录后，会触发mysql的完整流程，所以prisma此时可用。为了保证mysql的连接池完全可用，
  // waitForDatabaseReady中使用mysql2进行连接，mysql2内部会执行‘SELECT 1’，也会触发mysql
  // 完整流程，因此可以确保prisma可以正常连接数据库。
  await waitForDatabaseReady();
  const adapter = new InversifyExpressHttpAdapter(container);

  // 全局中间件
  adapter.applyGlobalMiddleware(
    // cors处理
    MIDDLEWARES.CorsMiddleware,
    // token校验
    AUTH_MIDDLEWARES.AuthMiddleware,
    // 接口success状态的响应格式化处理
    MIDDLEWARES.ResponseMiddleware,
  );

  // 全局错误处理
  adapter.useGlobalFilters(GlobalErrorFilter);

  const app = await adapter.build();

  // 浏览器发送的OPTIONS请求不会被inversify捕捉到，因此这里需要兜底处理OPTIONS请求
  app.use(CorsMiddleware.middleware);

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on ${env.PORT}...`);
  });
}

bootstrap();
