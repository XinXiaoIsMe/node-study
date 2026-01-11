import { injectable } from 'inversify';
import { BaseValidator } from '@/common/middleware/base-validator.middleware';
import { UpdateAvatarDto } from '../dto/user.dto';

@injectable()
export class UpdateAvatarValidator extends BaseValidator {
  dto = UpdateAvatarDto;
}
