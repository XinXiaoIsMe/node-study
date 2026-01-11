import type { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }

    interface Response {
      success: <T>(data: T, message?: string) => void;
    }
  }
}
