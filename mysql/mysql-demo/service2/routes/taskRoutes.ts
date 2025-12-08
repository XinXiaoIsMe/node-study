import express from 'express';
import {
    getTasks,
    createTaskController,
    getTasksByRangeController,
    updateTaskStatusController,
    updateTaskDetailController
} from '../controllers/taskController';

const router = express.Router();

router.get('/', getTasks);
router.post('/', createTaskController);
router.post('/range', getTasksByRangeController);
router.patch('/:taskId/status', updateTaskStatusController);
router.put('/:taskId', updateTaskDetailController);

export default router;
