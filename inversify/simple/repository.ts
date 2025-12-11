import { injectable } from "inversify";

@injectable()
export class UserRepository {
    findAll() {
        return ['Bob', 'Mary'];
    }
}
