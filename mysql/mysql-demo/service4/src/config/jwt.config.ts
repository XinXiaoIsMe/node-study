import { env } from './env';

export const jwtConfig = {
  accessTokenExpiresIn: env.JWT_ACCESS_TOKEN_EXPIRES_IN || '1h',
} as const;
