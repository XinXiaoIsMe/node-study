import type { TaskPriority, TaskStatus } from '@db/client';

export interface CreateTaskProfileModel {
  title: string;
  priority: TaskPriority;
  description?: string | null;
  startDate?: Date | null;
  dueDate?: Date | null;
}

export interface TaskProfileModel {
  id: number;
  title: string;
  priority: TaskPriority;
  description?: string | null;
  startDate?: Date | null;
  dueDate?: Date | null;
  status: TaskStatus;
}

export interface UpdateTaskProfileModel {
  title?: string;
  priority?: TaskPriority;
  description?: string | null;
  startDate?: Date | null;
  dueDate?: Date | null;
  status?: TaskStatus;
}

export interface TaskRangeModel {
  startDate: Date;
  dueDate: Date;
}
