import type { Role } from '@db/client';
import { Expose } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetUserResponseDto {
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

  @Expose()
  @IsString()
  @IsOptional()
  updateTime!: Date | null;
}

export class CanUpdateUserProfileRequestDto {
  @Expose()
  @IsString()
  username!: string;

  @Expose()
  @IsString()
  @IsOptional()
  nickname?: string | null;

  @Expose()
  @IsInt()
  @IsOptional()
  gender?: number | null;

  @Expose()
  @IsNotEmpty()
  @IsString()
  role!: Role;

  @Expose()
  @IsString()
  @IsOptional()
  selfIntro?: string | null;
}

export class UpdateUserProfileRequestDto extends CanUpdateUserProfileRequestDto {
  @Expose()
  @IsInt()
  userId!: number;
}

export class UpdateUserProfileResponseDto {
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

  @Expose()
  @IsString()
  @IsOptional()
  updateTime!: Date | null;
}

export class UpdateUserAvatarResponseDto {
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

  @Expose()
  @IsString()
  @IsOptional()
  updateTime!: Date | null;
}

export class GetUserAvatarRequestDto {
  @IsString()
  token!: string;

  @IsString()
  @IsOptional()
  userId?: string;
}

export class CreateUserRequestDto {
  @Expose()
  @IsString()
  username!: string;

  @Expose()
  @IsString()
  password!: string;

  @Expose()
  @IsString()
  @IsOptional()
  nickname?: string | null;

  @Expose()
  @IsInt()
  @IsOptional()
  gender?: number | null;

  @Expose()
  @IsNotEmpty()
  @IsString()
  role?: Role;

  @Expose()
  @IsString()
  @IsOptional()
  selfIntro?: string | null;

  @Expose()
  @IsString()
  @IsOptional()
  avatar?: string | null;
}

export class DeleteUserDto {
  @Expose()
  @IsString()
  userId!: string;
}
