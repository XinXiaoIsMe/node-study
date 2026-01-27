import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

// 更新 Todo 的入参（支持部分更新）
export class UpdateTodoDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
