import type { TaskStatus } from '@db/enums';
import type { Request as ExpressRequest } from 'express';
import type { UpdateTaskRequestDto } from '@/domain/dto';
import type { ITaskController, ITaskService } from '@/interface';
import { TYPES } from '@container/types';
import { ApplyMiddleware, Controller, Get, Patch, Post, Put, Request } from '@inversifyjs/http-core';

import { inject } from 'inversify';
import { CreateTaskRequestDto, CreateTaskResponseDto, TaskResponseDto } from '@/domain/dto';
import { formatResponse, toDto } from '@/utils';

@Controller('/api/tasks')
export class TaskController implements ITaskController {
  constructor(
    @inject(TYPES.TaskService) private readonly _taskService: ITaskService,
  ) {}

  @ApplyMiddleware(TYPES.Auth)
  @Post('/')
  async createTask(@Request() req: ExpressRequest) {
    const userId: number = req.user!.userId;
    const taskPayload: CreateTaskRequestDto = toDto(CreateTaskRequestDto, req.body);
    const data = await this._taskService.createTask(userId, taskPayload);
    return formatResponse(data, '创建任务成功！', CreateTaskResponseDto);
  }

  @ApplyMiddleware(TYPES.Auth)
  @Get('/')
  async getTasks(@Request() req: ExpressRequest) {
    const userId: number = req.user!.userId;
    const status: TaskStatus = req.query.status as TaskStatus;
    const tasks = await this._taskService.getTasks(userId, status);
    return formatResponse(tasks, '查询任务成功！', TaskResponseDto);
  }

  @ApplyMiddleware(TYPES.Auth)
  @Patch('/:id/status')
  async toggleTaskStatus(@Request() req: ExpressRequest) {
    const id: number = Number.parseInt(req.params.id);
    const status: TaskStatus = req.body.status;
    const task = await this._taskService.updateTask(id, { status });
    return formatResponse(task, '更新任务状态成功！', TaskResponseDto);
  }

  @ApplyMiddleware(TYPES.Auth)
  @Put('/:id')
  async updateTask(@Request() req: ExpressRequest) {
    const id: number = Number.parseInt(req.params.id);
    const taskProfile: UpdateTaskRequestDto = req.body;
    const task = await this._taskService.updateTask(id, taskProfile);
    return formatResponse(task, '更新任务状态成功！', TaskResponseDto);
  }

  @ApplyMiddleware(TYPES.Auth)
  @Post('/range')
  async getTasksByRange(@Request() req: ExpressRequest) {
    const userId: number = req.user!.userId;
    const { startDate, endDate } = req.body;
    const tasks = await this._taskService.getTasksByRange(userId, { startDate, endDate });
    return formatResponse(tasks, '查询任务成功！', TaskResponseDto);
  }
}
