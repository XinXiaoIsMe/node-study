import { inject, injectable } from "inversify";
import { TYPES } from './types';
import { UserRepository } from "./repository";

@injectable()
export class UserService {
    constructor (
        @inject(TYPES.UserRepository) private repo: UserRepository
    ) {}

    getUserList () {
        // 從倉庫裡面獲取數據
        return this.repo.findAll();
    }
}
