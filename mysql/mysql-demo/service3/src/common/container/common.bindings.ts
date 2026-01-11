import type { Container } from 'inversify';
import type { PrismaDb } from '../../prisma/client';
import { prismaDb } from '@/prisma/instance';
import { GlobalErrorFilter } from '../filter/error.filter';
import { MIDDLEWARES, TYPES } from '../ioc/common-types';
import { CorsMiddleware } from '../middleware/cors.middleware';
import { ResponseMiddleware } from '../middleware/response.middleware';
/**
 * 绑定公共模块
 * @param container 容器
 */
export function bindCommon(container: Container) {
  // prisma 这里必须使用单例，否则会造成数据库连接爆炸，导致应用无法正常启动
  container.bind<PrismaDb>(TYPES.PrismaDb).toConstantValue(prismaDb);
  // middlewares
  container.bind<CorsMiddleware>(MIDDLEWARES.CorsMiddleware).to(CorsMiddleware).inSingletonScope();
  container.bind<ResponseMiddleware>(MIDDLEWARES.ResponseMiddleware).to(ResponseMiddleware).inSingletonScope();
  // filters
  container.bind<GlobalErrorFilter>(GlobalErrorFilter).toSelf();
}
