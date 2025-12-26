import { Controller, Get } from '@inversifyjs/http-core';

@Controller('api/users')
export class UserController {
  @Get('/me')
  getUserProfile() {
    return {};
  }
}
