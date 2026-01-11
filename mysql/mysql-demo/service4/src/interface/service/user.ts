import type { GetUserModel } from '@model';

export interface IUserService {
  getCurrentUser: (userId: number) => Promise<GetUserModel>;
}
