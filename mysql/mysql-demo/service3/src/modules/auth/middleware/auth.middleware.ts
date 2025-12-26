import type { ExpressMiddleware } from '@inversifyjs/http-express';
import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '@shared/errors';
import { injectable } from 'inversify';
import { extractToken, isWhitelisted } from '../utils';

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

    next();
  }
}
