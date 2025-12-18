import { IsString } from 'class-validator';
import type { Role } from '../../../../generated/prisma/client';

export class LoginRequestDto {
    @IsString()
    username!: string;

    @IsString()
    password!: string;
}

interface UserResponseDto {
    avatarUpdatedAt: string | null;
    userId: number;
    username: string;
    nickname: string | null;
    gender: number | null;
    role: Role;
    selfIntro: string | null;
}

export interface LoginResponseDto {
    token: string;
    message: string;
    user: UserResponseDto;
}
