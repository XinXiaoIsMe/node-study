import { inject, injectable } from "inversify";
import { type UserService } from "./service";
import { TYPES } from "./types";

@injectable()
export class UserController {
    constructor (
        @inject(TYPES.UserService) private service: UserService
    ) {}

    showUsers () {
        const users = this.service.getUserList();
        console.log(`users: ${users.join(',')}`);
    }
}
