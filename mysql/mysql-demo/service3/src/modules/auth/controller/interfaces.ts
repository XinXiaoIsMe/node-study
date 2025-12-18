import { LoginRequestDto, LoginResponseDto } from '../dto/login.dto';

export interface IAuthController {
    login(data: LoginRequestDto): Promise<LoginResponseDto>;
}
