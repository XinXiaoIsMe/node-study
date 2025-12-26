import type { Request } from 'express';

export interface IUserController {
  getCurrentUser: (req: Request) => Promise<any>;
}
