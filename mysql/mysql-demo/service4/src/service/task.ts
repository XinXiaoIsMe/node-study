import type { TaskStatus } from '@db/enums';
import type { CreateTaskProfileModel, TaskProfileModel, UpdateTaskProfileModel } from '@/domain/model';
import type { ITaskRepository, ITaskService, TaskRange } from '@/interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/container/types';
import { normalizeOptionalDateTime } from './utils';

@injectable()
export class TaskService implements ITaskService {
  constructor(
    @inject(TYPES.TaskRepository) private readonly _taskReqo: ITaskRepository,
  ) {}

  async createTask(userId: number, taskProfile: CreateTaskProfileModel): Promise<TaskProfileModel> {
    const normalizedStartDate = normalizeOptionalDateTime(taskProfile.startDate as unknown, 'startDate');
    const normalizedDueDate = normalizeOptionalDateTime(taskProfile.dueDate as unknown, 'dueDate');

    const data = await this._taskReqo.createTask({
      createdBy: userId,
      title: taskProfile.title,
      priority: taskProfile.priority,
      description: taskProfile.description,
      startDate: normalizedStartDate,
      dueDate: normalizedDueDate,
    });
    const {
      id,
      title,
      priority,
      description,
      startDate,
      dueDate,
      status,
    } = data;
    return {
      id,
      title,
      priority,
      description,
      startDate,
      dueDate,
      status,
    };
  }

  async getTasks(userId: number, status?: TaskStatus): Promise<TaskProfileModel[]> {
    const tasks = await this._taskReqo.getTasks(userId, status);

    return tasks.map(({
      id,
      title,
      priority,
      description,
      startDate,
      dueDate,
      status,
    }) => ({
      id,
      title,
      priority,
      description,
      startDate,
      dueDate,
      status,
    }));
  }

  async updateTask(taskId: number, taskProfile: UpdateTaskProfileModel) {
    taskProfile.startDate = normalizeOptionalDateTime(taskProfile.startDate as unknown, 'startDate');
    taskProfile.dueDate = normalizeOptionalDateTime(taskProfile.dueDate as unknown, 'dueDate');

    const {
      id,
      title,
      priority,
      description,
      startDate,
      dueDate,
      status,
    } = await this._taskReqo.updateTask(taskId, taskProfile);
    return {
      id,
      title,
      priority,
      description,
      startDate,
      dueDate,
      status,
    };
  }

  async getTasksByRange(userId: number, { startDate, endDate }: TaskRange) {
    const tasks = await this._taskReqo.getTasksByRange(userId, {
      startDate: normalizeOptionalDateTime(startDate, 'startDate') as Date,
      dueDate: normalizeOptionalDateTime(endDate, 'startDate') as Date,
    });
    return tasks.map(({
      id,
      title,
      priority,
      description,
      startDate,
      dueDate,
      status,
    }) => ({
      id,
      title,
      priority,
      description,
      startDate,
      dueDate,
      status,
    }));
  }
}
