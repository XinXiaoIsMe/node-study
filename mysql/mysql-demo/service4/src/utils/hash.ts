import bcrypt from 'bcryptjs';

/**
 * 使用bcrypt对密码进行加密
 * @param plainPassword 密码明文
 */
export function hashPassword(plainPassword: string): string {
  return bcrypt.hashSync(plainPassword, 10);
}
