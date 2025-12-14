import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { UpdateUserDTO } from "../user/user.dto";
import { IUserService } from '../user/types';
import { TYPES } from '../constants/types';
import { validateRequest } from './validator';

@injectable()
export class ValidateUpdateUser {
    constructor(
        @inject(TYPES.UserService)
        private readonly userService: IUserService
    ) {}

    async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
        // 首先校验DTO(注意这里没有校验id)
        const { valid, errors } = await validateRequest(UpdateUserDTO, req, { allowId: true });

        if (!valid) {
            res.status(400).json({
                code: 40001,
                message: 'Validation failed',
                errors
            });
            return;
        }

        // 校验id
        const { id } = req.body;
        if (typeof id !== 'number') {
            res.status(400).json({
                code: 40001,
                message: 'id is required and must be a number'
            });
            return;
        }

        // 校验用户是否存在
        const user = await this.userService.getUserById(id);
        if (!user) {
            res.status(400).json({
                code: 40401,
                message: `User with id ${id} not found`,
            });
            return;
        }

        next();
    }
}
