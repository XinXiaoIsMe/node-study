import type { Role } from '@db/client';
import { IsString } from 'class-validator';

export interface UserResponseDto {
  avatarUpdatedAt: string | null;
  userId: number;
  username: string;
  nickname: string | null;
  gender: number | null;
  role: Role;
  selfIntro: string | null;
}

export class LoginRequestDto {
  @IsString()
  username!: string;

  @IsString()
  password!: string;
}

export interface LoginResponseDto {
  token: string;
  message: string;
  user: UserResponseDto;
}
