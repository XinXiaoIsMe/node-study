import type { LoginResponseDto } from '../dto/login.dto';

export interface IAuthService {
    login(username: string, password: string): Promise<LoginResponseDto>;
}