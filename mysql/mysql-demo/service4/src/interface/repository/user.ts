import type { GetUserProfile } from '@/domain/model';

export interface IUserRepository {
  getUserById: (userId: number) => Promise<GetUserProfile | null>;
}
