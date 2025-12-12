import { controller, httpGet } from 'inversify-express-utils';

@controller('/user')
export class UserController {
    @httpGet('/all')
    getUser () {
        return []
    }
}
