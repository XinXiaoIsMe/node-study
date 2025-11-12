import { Router } from 'express'
import {
  getTasks,
  createTaskController,
  updateTaskStatusController,
  updateTaskDetailController,
  getTasksByRangeController
} from '../controllers/taskController'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.use(requireAuth)

router.get('/', getTasks)
router.post('/range', getTasksByRangeController)
router.post('/', createTaskController)
router.patch('/:taskId/status', updateTaskStatusController)
router.put('/:taskId', updateTaskDetailController)

export default router
