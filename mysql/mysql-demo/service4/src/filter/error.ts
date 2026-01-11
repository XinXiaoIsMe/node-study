import type { ExpressErrorFilter } from '@inversifyjs/http-express';
import type { Request, Response } from 'express';
import { HttpError } from '@common/errors';
import { CatchError } from '@inversifyjs/http-core';

/**
 * 全局错误校验
 */
@CatchError()
export class GlobalErrorFilter implements ExpressErrorFilter {
  catch(error: unknown, _req: Request, res: Response) {
    // 如果是http错误，则使用里面记载的信息
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({
        code: error.code,
        success: false,
        message: error.message,
        data: error.details,
      });
      return;
    }

    // eslint-disable-next-line no-console
    console.log(error);
    // 其余错误指定为内部服务错误
    res.status(500).json({
      code: 500,
      success: false,
      message: 'Internal Server Error',
    });
  }
}
