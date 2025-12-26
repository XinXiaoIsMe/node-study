import type { Request } from 'express';
import type { JwtPayload, SignOptions } from 'jsonwebtoken';
import { env } from '@config/env';
import { jwtConfig } from '@config/jwt.config';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '@/shared/errors';

/**
 * 生成token
 * @param userId 用户id
 * @returns token
 */
export function signAccessToken(userId: number) {
  return jwt.sign(
    { userId },
    env.JWT_SECRET,
    { expiresIn: jwtConfig.accessTokenExpiresIn } as SignOptions,
  );
}

/**
 * 校验token
 * @param token token字符串
 */
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  }
  catch (e: unknown) {
    const { TokenExpiredError, JsonWebTokenError } = jwt;
    if (e instanceof TokenExpiredError) {
      throw new UnauthorizedError({
        message: '登录已过期，请重新登录',
      });
    }

    if (e instanceof JsonWebTokenError) {
      throw new UnauthorizedError({
        message: 'token校验失败！',
      });
    }

    throw e;
  }
}

/**
 * 从请求头里面提取token信息
 * @param req 请求体对象
 * @returns token
 */
export function extractToken(req: Request) {
  const auth = req.headers.authorization;
  if (!auth)
    return null;
  if (!auth.startsWith('Bearer '))
    return null;
  return auth.slice(7);
}
