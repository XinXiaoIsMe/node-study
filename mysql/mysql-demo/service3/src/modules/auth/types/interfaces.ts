import { LoginDto } from '../dto/login.dto';

export interface IAuthController {
    login(data: LoginDto): Promise<any>;
}

export interface IAuthService {
    login(username: string, password: string): Promise<any>;
}

export interface IAuthRepository {
    findByUsername(username: string): Promise<any>;
}
