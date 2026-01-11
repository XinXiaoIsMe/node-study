import type { ExpressMiddleware } from '@inversifyjs/http-express';
import type { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '@/common/errors';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

/**
 * 校验参数
 */
export abstract class BaseValidator implements ExpressMiddleware {
  abstract dto: any;

  async execute(req: Request, _res: Response, next: NextFunction) {
    const params = {
      ...(req.params ?? {}),
      ...(req.query ?? {}),
      ...(req.body ?? {}),
    };

    const instance = plainToInstance(this.dto, params);
    const errors = await validate(instance);

    if (errors.length) {
      throw new BadRequestError({
        message: '参数错误',
        details: errors,
      });
    }

    next();
  }
}
