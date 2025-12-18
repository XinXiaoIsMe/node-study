import jwt, { type SignOptions } from 'jsonwebtoken';
import { jwtConfig } from '../../../../jwt.config';

/**
 * 生成token
 * @param userId 用户id
 * @returns token
 */
export function signAccessToken (userId: number) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET!,
        { expiresIn: jwtConfig.accessTokenExpiresIn } as SignOptions
    );
}