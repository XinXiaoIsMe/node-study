import { ExpressMiddleware } from '@inversifyjs/http-express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

export abstract class BaseValidator implements ExpressMiddleware {
    abstract dto: any;

    async execute(req: Request, res: Response, next: NextFunction) {
        const params = {
            ...(req.params ?? {}),
            ...(req.query ?? {}),
            ...(req.body ?? {})
        };

        const instance = plainToInstance(this.dto, params);
        const errors = await validate(instance);

        if (errors.length) {
            res.status(400).json({
                code: 40001,
                message: 'Validation failed',
                errors
            });
            return;
        }

        next();
    }
}