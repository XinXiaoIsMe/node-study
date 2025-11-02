import { Router } from 'express'
import { createUserController } from '../controllers/userController'
import { requireAdmin, requireAuth } from '../middleware/auth'

const router = Router()

router.post('/', requireAuth, requireAdmin, createUserController)

export default router
