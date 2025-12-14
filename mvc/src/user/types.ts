import { CreateUserDTO, UpdateUserDTO } from "./user.dto";

export interface IUserRepository {
    findOne(id: number): Promise<any>;
    findAll(): Promise<any[]>;
    create(data: CreateUserDTO): Promise<any>;
    update(id: number, data: UpdateUserDTO): Promise<any>;
    delete(id: number): Promise<any>;
}

export interface IUserService {
    getUserById(id: number): Promise<any>;
    getUsers(): Promise<any[]>;
    createUser(data: CreateUserDTO): Promise<any>;
    updateUser(id: number, data: UpdateUserDTO): Promise<any>;
    deleteUser(id: number): Promise<any>;
}

export interface IUserController {
    getUserById(params: { id: string }): Promise<any>;
    getUsers(): Promise<any[]>;
    createUser(data: CreateUserDTO): Promise<any>;
    updateUser(data: UpdateUserDTO & { id: number }): Promise<any>;
    deleteUser(params: { id: string }): Promise<any>;
}
