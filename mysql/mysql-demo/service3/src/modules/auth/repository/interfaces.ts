import type { UserForLogin } from './types';

export interface IAuthRepository {
    findByUsernameForLogin(username: string): Promise<UserForLogin | null>;
}