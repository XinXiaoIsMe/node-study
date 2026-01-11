import type { TaskStatus } from '@db/enums';
import type { CreateTaskProfileModel, TaskProfileModel, UpdateTaskProfileModel } from '@model';

export interface TaskRange {
  startDate: string;
  endDate: string;
}

export interface ITaskService {
  createTask: (userId: number, taskProfile: CreateTaskProfileModel) => Promise<TaskProfileModel>;
  getTasks: (userId: number, status?: TaskStatus) => Promise<TaskProfileModel[]>;
  updateTask: (taskId: number, taskProfile: UpdateTaskProfileModel) => Promise<TaskProfileModel>;
  getTasksByRange: (userId: number, range: TaskRange) => Promise<TaskProfileModel[]>;
}
