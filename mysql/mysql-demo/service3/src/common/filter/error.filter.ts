import type { ExpressErrorFilter } from '@inversifyjs/http-express';
import type { Request, Response } from 'express';
import { CatchError } from '@inversifyjs/http-core';
import { HttpError } from '../errors';

/**
 * 全局错误校验
 */
@CatchError()
export class GlobalErrorFilter implements ExpressErrorFilter {
  catch(error: unknown, _req: Request, res: Response) {
    // 如果是http错误，则使用里面记载的信息
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({
        errorCode: error.errorCode,
        success: false,
        message: error.message,
        details: error.details,
      });
      return;
    }

    console.log(error);

    // 其余错误指定为内部服务错误
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      errorCode: 'INTERNAL_SERVER_ERROR',
    });
  }
}
