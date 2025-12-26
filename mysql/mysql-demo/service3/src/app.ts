import 'dotenv/config';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { container } from './container';
import { CorsMiddleware } from './common/middleware/cors.middleware';
import { MIDDLEWARES } from './common/ioc/common-types';
import { GlobalErrorFilter } from './common/filter/error.filter';
import { env } from '@config/env';

async function bootstrap () {
    const adapter = new InversifyExpressHttpAdapter(container);

    adapter.applyGlobalMiddleware(
        MIDDLEWARES.CorsMiddleware
    );

    adapter.useGlobalFilters(GlobalErrorFilter);

    const app = await adapter.build();

    // 浏览器发送的OPTIONS请求不会被inversify捕捉到，因此这里需要兜底处理OPTIONS请求
    app.use(CorsMiddleware.middleware);

    app.listen(env.PORT, () => {
        console.log(`Server is running on ${env.PORT}...`);
    });
}

bootstrap();