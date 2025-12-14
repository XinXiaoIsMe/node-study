import { Controller, Get, Params, Post, Body, ApplyMiddleware, Put, Delete } from '@inversifyjs/http-core';
import { inject } from 'inversify';
import { IUserController, IUserService } from './types';
import { MIDDLEWARES, TYPES } from '../constants/types';
import { CreateUserDTO, UpdateUserDTO } from './user.dto';

@Controller('/user')
export class UserController implements IUserController {
    constructor(
        @inject(TYPES.UserService)
        private readonly userService: IUserService
    ) {}

    @Get('/:id')
    getUserById(@Params() params: { id: string }) {
        return this.userService.getUserById(Number(params.id));
    }

    @Get('/')
    getUsers() {
        return this.userService.getUsers();
    }

    @ApplyMiddleware(MIDDLEWARES.ValidateCreateUser)
    @Post('/create')
    createUser(@Body() data: CreateUserDTO): Promise<any> {
        return this.userService.createUser(data);
    }

    @ApplyMiddleware(MIDDLEWARES.ValidateUpdateUser)
    @Put('/update')
    updateUser(@Body() data: UpdateUserDTO & { id: number; }): Promise<any> {
        const { id, ...updateData } = data;
        return this.userService.updateUser(id, updateData);
    }

    @Delete('/delete/:id')
    deleteUser(@Params() params: { id: string }): Promise<any> {
        return this.userService.deleteUser(Number(params.id));
    }
}
