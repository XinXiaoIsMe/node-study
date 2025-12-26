import type { Container } from 'inversify';
import { PrismaDb } from '../../prisma/client';
import { GlobalErrorFilter } from '../filter/error.filter';
import { MIDDLEWARES, TYPES } from '../ioc/common-types';
import { CorsMiddleware } from '../middleware/cors.middleware';

/**
 * 绑定公共模块
 * @param container 容器
 */
export function bindCommon(container: Container) {
  // prisma
  container.bind<PrismaDb>(TYPES.PrismaDb).to(PrismaDb);
  // middlewares
  container.bind<CorsMiddleware>(MIDDLEWARES.CorsMiddleware).to(CorsMiddleware).inSingletonScope();
  // filters
  container.bind<GlobalErrorFilter>(GlobalErrorFilter).toSelf();
}
