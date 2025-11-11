import type { Request, Response } from 'express'
import {
  createTask,
  listTasksByUser,
  updateTaskStatus,
  updateTaskDetail,
  findTaskByIdForUser,
  TaskPriority,
  TaskStatus,
} from '../models/taskModel'

export const listTasks = async (req: Request, res: Response) => {
  if (!req.session) {
    res.status(401).json({ message: '未授权' })
    return
  }

  try {
    const status = req.query?.status as TaskStatus;
    const tasks = await listTasksByUser(req.session.userId, status)
    res.json({ tasks })
  } catch (error) {
    console.error('List tasks failed:', error)
    res.status(500).json({ message: '服务器错误，请稍后重试' })
  }
}

export const createTaskController = async (req: Request, res: Response) => {
  if (!req.session) {
    res.status(401).json({ message: '未授权' })
    return
  }

  const { title, description = '', dueDate = null, priority = 'medium' } = req.body ?? {}

  if (!title || !title.trim()) {
    res.status(400).json({ message: '任务标题不能为空' })
    return
  }

  if (!['low', 'medium', 'high'].includes(priority)) {
    res.status(400).json({ message: '任务优先级不合法' })
    return
  }

  try {
    const normalizedDueDate = dueDate && typeof dueDate === 'string' && dueDate.trim().length > 0 ? dueDate : null
    const normalizedPriority = priority as TaskPriority
    const insertId = await createTask({
      title: title.trim(),
      description: description || '',
      dueDate: normalizedDueDate,
      priority: normalizedPriority,
      status: 'pending',
      createdBy: req.session.userId,
    })

    res.status(201).json({
      message: '任务创建成功',
      task: {
        id: insertId,
        title: title.trim(),
        description: description || '',
        dueDate: normalizedDueDate,
        priority: normalizedPriority,
        status: 'pending',
        createdBy: req.session.userId,
      },
    })
  } catch (error) {
    console.error('Create task failed:', error)
    res.status(500).json({ message: '服务器错误，请稍后重试' })
  }
}

export const updateTaskStatusController = async (req: Request, res: Response) => {
  if (!req.session) {
    res.status(401).json({ message: '未授权' })
    return
  }

  const taskId = Number(req.params.taskId)
  const { status } = req.body ?? {}

  if (!taskId || Number.isNaN(taskId)) {
    res.status(400).json({ message: '任务ID不合法' })
    return
  }

  if (!['pending', 'completed'].includes(status)) {
    res.status(400).json({ message: '任务状态不合法' })
    return
  }

  try {
    const updated = await updateTaskStatus(taskId, status as TaskStatus, req.session.userId)
    if (!updated) {
      res.status(404).json({ message: '任务不存在或无权操作' })
      return
    }
    res.json({ message: '任务状态已更新' })
  } catch (error) {
    console.error('Update task status failed:', error)
    res.status(500).json({ message: '服务器错误，请稍后重试' })
  }
}

export const updateTaskDetailController = async (req: Request, res: Response) => {
  if (!req.session) {
    res.status(401).json({ message: '未授权' })
    return
  }

  const taskId = Number(req.params.taskId)
  const { title, description = '', dueDate = null, priority = 'medium' } = req.body ?? {}

  if (!taskId || Number.isNaN(taskId)) {
    res.status(400).json({ message: '任务ID不合法' })
    return
  }

  if (!title || !title.trim()) {
    res.status(400).json({ message: '任务标题不能为空' })
    return
  }

  if (!['low', 'medium', 'high'].includes(priority)) {
    res.status(400).json({ message: '任务优先级不合法' })
    return
  }

  try {
    const normalizedDueDate = dueDate && typeof dueDate === 'string' && dueDate.trim().length > 0 ? dueDate : null
    const normalizedPriority = priority as TaskPriority
    const updated = await updateTaskDetail(taskId, req.session.userId, {
      title: title.trim(),
      description: description || '',
      dueDate: normalizedDueDate,
      priority: normalizedPriority,
    })

    if (!updated) {
      res.status(404).json({ message: '任务不存在或无权操作' })
      return
    }

    const task = await findTaskByIdForUser(taskId, req.session.userId)
    res.json({
      message: '任务已更新',
      task,
    })
  } catch (error) {
    console.error('Update task failed:', error)
    res.status(500).json({ message: '服务器错误，请稍后重试' })
  }
}
