import { ExpressMiddleware } from '@inversifyjs/http-express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../../shared/errors';

/**
 * 校验参数
 */
export abstract class BaseValidator implements ExpressMiddleware {
    abstract dto: any;

    async execute(req: Request, _res: Response, next: NextFunction) {
        const params = {
            ...(req.params ?? {}),
            ...(req.query ?? {}),
            ...(req.body ?? {})
        };

        const instance = plainToInstance(this.dto, params);
        const errors = await validate(instance);

        if (errors.length) {
            throw new HttpError(200, 'Validation failed', errors);
        }

        next();
    }
}