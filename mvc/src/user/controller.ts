import { Controller, Get } from '@inversifyjs/http-core';

@Controller('/user')
export class UserController {
    @Get('/all')
    getUser () {
        return []
    }
}
