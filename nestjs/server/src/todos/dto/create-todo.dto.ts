import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// 创建 Todo 的入参
export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;
}
