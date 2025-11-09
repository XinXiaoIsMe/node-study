import { Router } from 'express'
import {
  avatarUploadMiddleware,
  createUserController,
  getAvatar,
  getProfile,
  updateAvatar,
  updateProfile,
} from '../controllers/userController'
import { requireAdmin, requireAuth } from '../middleware/auth'

const router = Router()

router.post('/', requireAuth, requireAdmin, createUserController)
router.get('/me', requireAuth, getProfile)
router.put('/me', requireAuth, updateProfile)
router.post('/me/avatar', requireAuth, avatarUploadMiddleware, updateAvatar)
router.get('/me/avatar', requireAuth, getAvatar)

export default router
