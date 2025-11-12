import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { pool } from '../database'

export type TaskStatus = 'pending' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface TaskRecord {
  id: number
  title: string
  description: string
  startDate: string | null
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
  start_date: string | null
  due_date: string | null
  priority: TaskPriority
  status: TaskStatus
  created_by: number
  create_time: string
  update_time: string
}

interface SqlOptions {
  status?: TaskStatus;
  dateRange?: [string, string];
}

export const createTask = async (task: {
  title: string
  description: string
  startDate: string | null
  dueDate: string | null
  priority: TaskPriority
  status: TaskStatus
  createdBy: number
}) => {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO tasks (title, description, start_date, due_date, priority, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [task.title, task.description, task.startDate, task.dueDate, task.priority, task.status, task.createdBy],
  )
  return result.insertId
}

export const listTasks = async (userId: number, options: SqlOptions = {}): Promise<TaskRecord[]> => {
  const [sql, sqlParams] = getQuerySql(userId, options)
  const [rows] = await pool.execute<TaskRow[]>(sql, sqlParams)

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    startDate: row.start_date ? new Date(row.start_date).toISOString() : null,
    dueDate: row.due_date ? new Date(row.due_date).toISOString() : null,
    priority: row.priority,
    status: row.status,
    createdBy: row.created_by,
    createTime: row.create_time ? new Date(row.create_time).toISOString() : '',
    updateTime: row.update_time ? new Date(row.update_time).toISOString() : '',
  }))
}

function getQuerySql (userId: number, options: SqlOptions = {}) {
  const { status, dateRange } = options;
  const queryStatusSql = status ? 'AND status = ?' : ''
  // dateRange here represents [startDate, endDate) half-open window for calendar
  // If a field is NULL, we consider that field unconstrained (i.e., satisfied)
  // so rows with NULL start_date or NULL due_date are not excluded by the range.
  const queryDateSql = dateRange
    ? 'AND (start_date IS NULL OR start_date >= ?) AND (due_date IS NULL OR due_date < DATE_ADD(?, INTERVAL 1 DAY))'
    : '';
  const sql = `SELECT id, title, description, start_date, due_date, priority, status, created_by, create_time, update_time
     FROM tasks
     WHERE created_by = ? ${queryStatusSql} ${queryDateSql}
     ORDER BY status ASC, due_date IS NULL, due_date ASC, create_time DESC`
  const sqlParams: Array<string | number> = [userId]

  if (status) {
    sqlParams.push(status)
  }

  if (dateRange) {
    sqlParams.push(...dateRange)
  }

  return [sql, sqlParams] as const
}

export const findTaskByIdForUser = async (taskId: number, userId: number): Promise<TaskRecord | null> => {
  const [rows] = await pool.execute<TaskRow[]>(
    `SELECT id, title, description, start_date, due_date, priority, status, created_by, create_time, update_time
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
    startDate: row.start_date ? new Date(row.start_date).toISOString() : null,
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
    startDate: string | null
    dueDate: string | null
    priority: TaskPriority
  },
) => {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE tasks
     SET title = ?, description = ?, start_date = ?, due_date = ?, priority = ?, update_time = CURRENT_TIMESTAMP
     WHERE id = ? AND created_by = ?`,
    [updates.title, updates.description, updates.startDate, updates.dueDate, updates.priority, taskId, userId],
  )
  return result.affectedRows > 0
}
