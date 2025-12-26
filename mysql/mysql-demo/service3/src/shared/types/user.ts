import type { Role } from '@prisma/client';

export interface UserResponseDto {
  avatarUpdatedAt: string | null;
  userId: number;
  username: string;
  nickname: string | null;
  gender: number | null;
  role: Role;
  selfIntro: string | null;
}
