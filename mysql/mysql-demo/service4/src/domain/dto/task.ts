import type { TaskPriority, TaskStatus } from '@db/enums';
import { Expose } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateTaskRequestDto {
  @Expose()
  @IsString()
  title!: string;

  @Expose()
  @IsString()
  priority!: TaskPriority;

  @Expose()
  @IsString()
  @IsOptional()
  description?: string | null;

  @Expose()
  @IsDate()
  @IsOptional()
  startDate?: Date | null;

  @Expose()
  @IsDate()
  @IsOptional()
  dueDate?: Date | null;
}

export class CreateTaskResponseDto {
  @Expose()
  @IsString()
  title!: string;

  @Expose()
  @IsString()
  priority!: TaskPriority;

  @Expose()
  @IsString()
  @IsOptional()
  description?: string | null;

  @Expose()
  @IsDate()
  @IsOptional()
  startDate?: Date | null;

  @Expose()
  @IsDate()
  @IsOptional()
  dueDate?: Date | null;
}

export class TaskResponseDto {
  @Expose()
  @IsInt()
  id!: number;

  @Expose()
  @IsString()
  title!: string;

  @Expose()
  @IsString()
  priority!: TaskPriority;

  @Expose()
  @IsString()
  @IsOptional()
  description?: string | null;

  @Expose()
  @IsDate()
  @IsOptional()
  startDate?: Date | null;

  @Expose()
  @IsDate()
  @IsOptional()
  dueDate?: Date | null;

  @Expose()
  @IsString()
  status!: TaskStatus;
}

export class UpdateTaskRequestDto {
  @Expose()
  @IsString()
  @IsOptional()
  title?: string;

  @Expose()
  @IsString()
  @IsOptional()
  priority?: TaskPriority;

  @Expose()
  @IsString()
  @IsOptional()
  description?: string | null;

  @Expose()
  @IsDate()
  @IsOptional()
  startDate?: Date | null;

  @Expose()
  @IsDate()
  @IsOptional()
  dueDate?: Date | null;
}
