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
