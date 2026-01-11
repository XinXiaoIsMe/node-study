import type { ExpressMiddleware } from '@inversifyjs/http-express';
import type { NextFunction, Request, Response } from 'express';
import { Role } from '@db/enums';
import { injectable } from 'inversify';
import { HttpError, UnauthorizedError } from '@/common/errors';
import { extractToken, isWhitelisted, verifyToken } from '../utils';

@injectable()
export class AuthMiddleware implements ExpressMiddleware {
  execute(req: Request, _res: Response, next: NextFunction) {
    if (isWhitelisted(req.path)) {
      next();
      return;
    }

    const token = extractToken(req);
    if (!token) {
      throw new UnauthorizedError({
        message: '权限校验失败!',
      });
    }

    // 校验token是否合法
    const payload = verifyToken(token);
    // 绑定user信息到req上，方便后续使用
    req.user = payload;

    next();
  }
}

export class AdminValidatorMiddleware implements ExpressMiddleware {
  execute(req: Request, _res: Response, next: NextFunction) {
    const token = extractToken(req);
    if (!token) {
      throw new UnauthorizedError({
        message: '权限校验失败!',
      });
    }

    // 校验token是否合法
    const payload = verifyToken(token);
    const { role } = payload;
    if (role !== Role.admin) {
      throw new HttpError(200, {
        message: '当前用户不是管理员！',
      });
    }

    next();
  }
}
