import { injectable } from 'inversify';
import { BaseValidator } from '../../../common/middleware/base-validator.middleware';
import { LoginRequestDto } from '../dto/login.dto';

@injectable()
export class LoginValidator extends BaseValidator {
  dto = LoginRequestDto;
}
