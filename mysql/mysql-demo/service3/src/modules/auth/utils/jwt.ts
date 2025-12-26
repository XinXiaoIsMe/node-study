import jwt, { type SignOptions } from 'jsonwebtoken';
import { jwtConfig } from '@config/jwt.config';
import { env } from '@config/env'

/**
 * 生成token
 * @param userId 用户id
 * @returns token
 */
export function signAccessToken (userId: number) {
    return jwt.sign(
        { userId },
       env.JWT_SECRET,
        { expiresIn: jwtConfig.accessTokenExpiresIn } as SignOptions
    );
}

/**
 * 校验token
 * @param token token字符串
 */
export function verifyToken (token: string) {
    return jwt.verify(token, env.JWT_SECRET);
}
