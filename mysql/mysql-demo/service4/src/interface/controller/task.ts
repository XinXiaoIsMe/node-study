import type { Request } from 'express';
import type { CreateTaskResponseDto, TaskResponseDto } from '@/domain/dto';
import type { ResponseData } from '@/types';

export interface ITaskController {
  createTask: (req: Request) => Promise<ResponseData<CreateTaskResponseDto>>;
  getTasks: (req: Request) => Promise<ResponseData<TaskResponseDto[]>>;
  toggleTaskStatus: (req: Request) => Promise<ResponseData<TaskResponseDto>>;
  updateTask: (req: Request) => Promise<ResponseData<TaskResponseDto>>;
  getTasksByRange: (req: Request) => Promise<ResponseData<TaskResponseDto[]>>;
}
