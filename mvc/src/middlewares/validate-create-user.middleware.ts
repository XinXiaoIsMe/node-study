import { injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { CreateUserDTO } from '../user/user.dto';
import { validateRequest } from './validator';

@injectable()
export class ValidateCreateUser {
    async execute(req: Request, res: Response, next: NextFunction) {
        const { valid, errors } = await validateRequest(CreateUserDTO, req, { allowId: false });
        if (!valid) {
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
