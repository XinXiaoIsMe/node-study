import type { ExpressMiddleware } from '@inversifyjs/http-express';
import type { NextFunction, Request, Response } from 'express';
import { injectable } from 'inversify';

const SUCCESS_MESSAGE = '操作成功';

@injectable()
export class ResponseMiddleware implements ExpressMiddleware {
  execute(_req: Request, res: Response, next: NextFunction) {
    res.success = (data, message = SUCCESS_MESSAGE) => {
      res.json({
        code: 0,
        data,
        message,
      });
    };
    next();
  }
}
