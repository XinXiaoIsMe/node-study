import type { UserProfile } from './types';

export interface IUserRepository {
  getUserProfileById: (userId: number) => Promise<UserProfile | null>;
}
