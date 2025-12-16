import { LoginDto } from '../dto/login.dto';

export interface IAuthController {
    login(data: LoginDto): Promise<any>;
}

export interface IAuthService {
    login(data: LoginDto): Promise<any>;
}

export interface IAuthRepository {
    findOne(username: string): Promise<any>;
}
