import { env } from '@config/env';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { AUTH_MIDDLEWARES } from '@/modules/auth/types/ioc-types';
import { GlobalErrorFilter } from './common/filter/error.filter';
import { MIDDLEWARES } from './common/ioc/common-types';
import { CorsMiddleware } from './common/middleware/cors.middleware';
import { container } from './container';
import 'dotenv/config';

async function bootstrap() {
  const adapter = new InversifyExpressHttpAdapter(container);

  adapter.applyGlobalMiddleware(
    // cors处理
    MIDDLEWARES.CorsMiddleware,
    // token校验
    AUTH_MIDDLEWARES.AuthMiddleware,
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
