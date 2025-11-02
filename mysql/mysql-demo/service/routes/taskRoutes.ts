import { Router } from 'express'
import {
  listTasks,
  createTaskController,
  updateTaskStatusController,
  updateTaskDetailController,
} from '../controllers/taskController'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.use(requireAuth)

router.get('/', listTasks)
router.post('/', createTaskController)
router.patch('/:taskId/status', updateTaskStatusController)
router.put('/:taskId', updateTaskDetailController)

export default router
