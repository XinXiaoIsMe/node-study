import type { Role } from '@db/browser';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  nickname?: string | null;

  @IsOptional()
  @IsInt()
  gender?: number | null;

  @IsOptional()
  @IsString()
  selfIntro?: string | null;
}

export class UpdateUserProfileResponseDto {
  @Type(() => UpdateUserProfileQueryDto)
  profile!: UpdateUserProfileQueryDto;
}

export class UpdateUserProfileQueryDto {
  @IsString()
  id!: string;

  @IsString()
  username!: string;

  @IsString()
  @IsOptional()
  nickname?: string | null;

  @IsInt()
  @IsOptional()
  gender?: number | null;

  @IsString()
  @IsOptional()
  selfIntro?: string | null;

  @IsNotEmpty()
  role!: Role;

  @IsString()
  avatarUpdatedAt!: string | null;
}

export class UpdateAvatarDto {
  @IsNotEmpty()
  avatar!: Uint8Array;
}

export class UpdateAvatarResponseDto {
  @Type(() => UpdateAvatarProfileDto)
  profile!: UpdateAvatarProfileDto;
}

export class UpdateAvatarProfileDto {
  @IsString()
  id!: string;

  @IsString()
  username!: string;

  @IsOptional()
  @IsString()
  nickname?: string | null;

  @IsOptional()
  @IsInt()
  gender!: number | null;

  @IsString()
  selfIntro!: string | null;

  @IsNotEmpty()
  role!: Role;

  @IsString()
  avatarUpdatedAt!: string | null;
}
