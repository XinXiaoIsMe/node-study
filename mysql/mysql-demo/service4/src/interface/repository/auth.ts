import type { LoginUserProfile } from '@model';

export interface IAuthRepository {
  findByUsername: (username: string) => Promise<LoginUserProfile | null>;
}
