import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { pool } from '../database'

export type TaskStatus = 'pending' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface TaskRecord {
  id: number
  title: string
  description: string
  dueDate: string | null
  priority: TaskPriority
  status: TaskStatus
  createdBy: number
  createTime: string
  updateTime: string
}

interface TaskRow extends RowDataPacket {
  id: number
  title: string
  description: string
  due_date: string | null
  priority: TaskPriority
  status: TaskStatus
  created_by: number
  create_time: string
  update_time: string
}

export const createTask = async (task: {
  title: string
  description: string
  dueDate: string | null
  priority: TaskPriority
  status: TaskStatus
  createdBy: number
}) => {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO tasks (title, description, due_date, priority, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [task.title, task.description, task.dueDate, task.priority, task.status, task.createdBy],
  )
  return result.insertId
}

export const listTasksByUser = async (userId: number): Promise<TaskRecord[]> => {
  const [rows] = await pool.execute<TaskRow[]>(
    `SELECT id, title, description, due_date, priority, status, created_by, create_time, update_time
     FROM tasks
     WHERE created_by = ?
     ORDER BY status ASC, due_date IS NULL, due_date ASC, create_time DESC`,
    [userId],
  )

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date ? new Date(row.due_date).toISOString() : null,
    priority: row.priority,
    status: row.status,
    createdBy: row.created_by,
    createTime: row.create_time ? new Date(row.create_time).toISOString() : '',
    updateTime: row.update_time ? new Date(row.update_time).toISOString() : '',
  }))
}

export const findTaskByIdForUser = async (taskId: number, userId: number): Promise<TaskRecord | null> => {
  const [rows] = await pool.execute<TaskRow[]>(
    `SELECT id, title, description, due_date, priority, status, created_by, create_time, update_time
     FROM tasks WHERE id = ? AND created_by = ? LIMIT 1`,
    [taskId, userId],
  )

  if (!rows.length) {
    return null
  }

  const row = rows[0]
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date ? new Date(row.due_date).toISOString() : null,
    priority: row.priority,
    status: row.status,
    createdBy: row.created_by,
    createTime: row.create_time ? new Date(row.create_time).toISOString() : '',
    updateTime: row.update_time ? new Date(row.update_time).toISOString() : '',
  }
}

export const updateTaskStatus = async (taskId: number, status: TaskStatus, userId: number) => {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE tasks SET status = ?, update_time = CURRENT_TIMESTAMP WHERE id = ? AND created_by = ?`,
    [status, taskId, userId],
  )
  return result.affectedRows > 0
}

export const updateTaskDetail = async (
  taskId: number,
  userId: number,
  updates: {
    title: string
    description: string
    dueDate: string | null
    priority: TaskPriority
  },
) => {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE tasks
     SET title = ?, description = ?, due_date = ?, priority = ?, update_time = CURRENT_TIMESTAMP
     WHERE id = ? AND created_by = ?`,
    [updates.title, updates.description, updates.dueDate, updates.priority, taskId, userId],
  )
  return result.affectedRows > 0
}
