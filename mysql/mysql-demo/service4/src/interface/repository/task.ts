import type { Prisma, Task, TaskStatus } from '@db/client';
import type { TaskRangeModel } from '@/domain/model';

export interface ITaskRepository {
  createTask: (taskProfile: Prisma.TaskCreateInput) => Promise<Task>;
  getTasks: (userId: number, status?: TaskStatus) => Promise<Task[]>;
  updateTask: (taskId: number, taskProfile: Omit<Prisma.TaskUpdateInput, 'id'>) => Promise<Task>;
  getTasksByRange: (userId: number, range: TaskRangeModel) => Promise<Task[]>;
}
