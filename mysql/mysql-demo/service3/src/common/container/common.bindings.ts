import { Container } from 'inversify';
import { CorsMiddleware } from '../middleware/cors';
import { MIDDLEWARES, TYPES } from '../ioc/common-types';
import { PrismaDb } from '../../prisma/client';

/**
 * 绑定公共模块
 * @param container 容器
 */
export function bindCommon(container: Container) {
    // prisma
    container.bind<PrismaDb>(TYPES.PrismaDb).to(PrismaDb);
    // middlewares
    container.bind(MIDDLEWARES.CorsMiddleware).to(CorsMiddleware).inSingletonScope();
}

