import type { Role } from '@db/client';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginRequestDto {
  @IsString()
  username!: string;

  @IsString()
  password!: string;
}

class UserProfileDto {
  @Expose()
  @IsInt()
  userId!: number;

  @Expose()
  @IsString()
  username!: string;

  @Expose()
  @IsString()
  @IsOptional()
  nickname!: string | null;

  @Expose()
  @IsInt()
  @IsOptional()
  gender!: number | null;

  @Expose()
  @IsNotEmpty()
  @IsString()
  role!: Role;

  @Expose()
  @IsString()
  @IsOptional()
  selfIntro!: string | null;
}

export class LoginResponseDto {
  @Expose()
  @IsString()
  token!: string;

  @Expose()
  @Type(() => UserProfileDto)
  user!: UserProfileDto;
}
