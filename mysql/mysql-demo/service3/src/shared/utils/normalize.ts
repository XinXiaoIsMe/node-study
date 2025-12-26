import type { User } from '../../../generated/prisma/client';

export function normalizeGender(gender?: any) {
  const genderValue = Number(gender);
  if (!Number.isNaN(genderValue) && genderValue > 0) {
    return genderValue;
  }
  return null;
}

export function normalizeRole(role?: string) {
  return role === 'admin' ? 'admin' : 'user';
}

export function getAvatarUpdatedTime(user: Partial<User>) {
  return user.avatarSize && user.updateTime ? new Date(user.updateTime).toISOString() : null;
}
