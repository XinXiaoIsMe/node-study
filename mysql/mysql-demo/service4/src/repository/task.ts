import type { Prisma, Task, TaskStatus } from '@db/client';
import type { TaskCreateInput } from '@db/models';
import type { TaskRangeModel } from '@/domain/model';
import type { ITaskRepository } from '@/interface';
import type { PrismaDb } from '@/prisma/client';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/container/types';

@injectable()
export class TaskRepository implements ITaskRepository {
  constructor(
    @inject(TYPES.PrismaDb) private readonly _db: PrismaDb,
  ) {}

  createTask(taskProfile: TaskCreateInput): Promise<Task> {
    return this._db.prisma.task.create({
      data: taskProfile,
    });
  }

  getTasks(userId: number, status?: TaskStatus): Promise<Task[]> {
    const where: Prisma.TaskWhereInput = status ? { createdBy: userId, status } : { createdBy: userId };
    return this._db.prisma.task.findMany({
      where,
    });
  }

  updateTask(taskId: number, taskProfile: Omit<Prisma.TaskUpdateInput, 'id'>): Promise<Task> {
    return this._db.prisma.task.update({
      where: { id: taskId },
      data: taskProfile,
    });
  }

  getTasksByRange(userId: number, range: TaskRangeModel): Promise<Task[]> {
    return this._db.prisma.task.findMany({
      where: {
        createdBy: userId,
        startDate: {
          gt: range.startDate,
          lt: range.dueDate,
        },
      },
    });
  }
}
