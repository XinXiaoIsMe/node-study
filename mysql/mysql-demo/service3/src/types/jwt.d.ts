// types/jwt.d.ts
import 'jsonwebtoken';

declare module 'jsonwebtoken' {
  interface JwtPayload {
    userId?: number;
  }
}
