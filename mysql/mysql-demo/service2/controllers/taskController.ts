import { Request, Response } from 'express';
import {
    type TaskStatus,
    type TaskPriority,
    listTasks,
    createTask,
    updateTaskStatus,
    updateTaskDetail,
    findTaskByIdForUser
} from '../models/taskModel';

export async function getTasks(req: Request, res: Response) {
    if (!req.session) return;

    try {
        const userId = req.session.userId;
        const status = req.query?.status as TaskStatus;
        const tasks = await listTasks(userId, {
            status
        });
        res.json({ tasks });
    } catch (error) {
        console.error('List tasks failed:', error);
        res.status(500).json({ message: '服务器错误，请稍后重试' });
    }
}

export async function createTaskController(req: Request, res: Response) {
    if (!req.session) return;

    const userId = req.session.userId;
    const {
        title,
        description = '',
        startDate = null,
        dueDate = null,
        priority = 'medium'
    } = req.body ?? {};

    if (!title || !title.trim()) {
        res.status(400).json({ message: '任务标题不能为空' })
        return
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
        res.status(400).json({ message: '任务优先级不合法' })
        return
    }

    try {
        const nowIso = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const normalizedStartDate = startDate && typeof startDate === 'string' && startDate.trim().length > 0 ? startDate : nowIso;
        const normalizedDueDate = dueDate && typeof dueDate === 'string' && dueDate.trim().length > 0 ? dueDate : null;
        const normalizedPriority = priority as TaskPriority;

        const insertId = await createTask({
            title: title.trim(),
            description: description || '',
            startDate: normalizedStartDate,
            dueDate: normalizedDueDate,
            priority: normalizedPriority,
            status: 'pending',
            createdBy: userId
        });
        res.status(201).json({
            message: '任务创建成功',
            task: {
                id: insertId,
                title: title.trim(),
                description: description || '',
                startDate: normalizedStartDate,
                dueDate: normalizedDueDate,
                priority: normalizedPriority,
                status: 'pending',
                createdBy: req.session!.userId,
            },
        })
    } catch (error) {
        console.error('Create task failed:', error);
        res.status(500).json({ message: '服务器错误，请稍后重试' });
    }
}

export async function getTasksByRangeController(req: Request, res: Response) {
    if (!req.session) return;

    const { startDate, endDate } = req.body ?? {};
    const userId = req.session.userId;
    if (!startDate || !endDate) {
        res.status(400).json({ message: '开始日期或者结束日期不能为空' });
        return
    }

    try {
        const tasks = await listTasks(userId, {
            dateRange: [startDate, endDate]
        });
        res.json({ tasks });
    } catch (error) {
        console.error('Update task failed:', error);
        res.status(500).json({ message: '服务器错误，请稍后重试' });
    }
}

export async function updateTaskStatusController(req: Request, res: Response) {
    if (!req.session) return;

    const taskId = Number(req.params.taskId);
    const { status } = req.body ?? {};

    if (!taskId || Number.isNaN(taskId)) {
        res.status(400).json({ message: '任务ID不合法' });
        return;
    }

    if (!['pending', 'completed'].includes(status)) {
        res.status(400).json({ message: '任务状态不合法' });
        return;
    }

    try {
        const updated = await updateTaskStatus(taskId, status as TaskStatus, req.session.userId);
        if (!updated) {
            res.status(404).json({ message: '任务不存在或无权操作' });
            return;
        }
        res.json({ message: '任务状态已更新' });
    } catch (error) {
        console.error('Update task status failed:', error);
        res.status(500).json({ message: '服务器错误，请稍后重试' });
    }
}

export async function updateTaskDetailController(req: Request, res: Response) {
    if (!req.session) return;

    const taskId = Number(req.params.taskId);
    const userId = req.session.userId;
    const {
        title,
        description = '',
        startDate = null,
        dueDate = null,
        priority = 'medium'
    } = req.body ?? {};

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
        const normalizedDueDate = dueDate && typeof dueDate === 'string' && dueDate.trim().length > 0 ? dueDate : null;
        const normalizedStartDate = startDate && typeof startDate === 'string' && startDate.trim().length > 0 ? startDate : null;
        const normalizedPriority = priority as TaskPriority;
        const updated = await updateTaskDetail(taskId, userId, {
            title: title.trim(),
            description,
            startDate: normalizedStartDate,
            dueDate: normalizedDueDate,
            priority: normalizedPriority
        });
        if (!updated) {
            res.status(404).json({ message: '任务不存在或无权操作' });
            return;
        }

        const task = await findTaskByIdForUser(taskId, userId);
        res.status(200).json({
            message: '任务已更新',
            task
        });
    } catch (error) {
        console.error('Update task failed:', error);
        res.status(500).json({ message: '服务器错误，请稍后重试' });
    }
}
