import { inject, injectable } from "inversify";
import { IUserRepository, IUserService } from "./types";
import { TYPES } from "../constants/types";
import { CreateUserDTO, UpdateUserDTO } from "./user.dto";

@injectable()
export class UserService implements IUserService {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly userRepo: IUserRepository
    ) {}

    getUserById (id: number): Promise<any> {
        return this.userRepo.findOne(id);
    }

    getUsers(): Promise<any[]> {
        return this.userRepo.findAll();
    }

    createUser(data: CreateUserDTO): Promise<any> {
        return this.userRepo.create(data);
    }

    updateUser(id: number, data: UpdateUserDTO): Promise<any> {
        return this.userRepo.update(id, data);
    }

    deleteUser(id: number): Promise<any> {
        return this.userRepo.delete(id);
    }
}
