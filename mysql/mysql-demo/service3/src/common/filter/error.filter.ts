import { CatchError } from '@inversifyjs/http-core';
import { ExpressErrorFilter } from '@inversifyjs/http-express';
import { Request, Response } from 'express';
import { BusinessError, HttpError } from '../../shared/errors';

@CatchError()
export class GlobalErrorFilter implements ExpressErrorFilter {
  catch(error: unknown, _req: Request, res: Response) {
    if (error instanceof BusinessError) {
      res.status(error.code).json({
        code: error.code,
        success: false,
        message: error.message
      });
      return;
    }

    if (error instanceof HttpError) {
      res.status(error.code).json({
        code: error.code,
        success: false,
        message: error.message,
        errors: error.errors
      });
      return;
    }

    res.status(500).json({
      code: 500,
      success: false,
      message: '服务器错误'
    });
  }
}