import type { LoginModel } from '@model';

export interface IAuthService {
  login: (username: string, password: string) => Promise<LoginModel>;
}
