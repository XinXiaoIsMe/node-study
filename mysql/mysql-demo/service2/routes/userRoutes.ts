import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { getUserController, getProfile, updateProfile, getAvatar, updateAvatar, avatarUploadMiddleware, createUserController, deleteUserController } from '../controllers/userController';

const router = express.Router();

router.get('/', requireAuth, requireAdmin, getUserController);
router.post('/', requireAuth, requireAdmin, createUserController);
router.delete('/:userId', requireAuth, requireAdmin, deleteUserController);
router.get('/me', requireAuth, getProfile);
router.put('/me', requireAuth, updateProfile);
router.get('/me/avatar', requireAuth, getAvatar);
router.post('/me/avatar', requireAuth, avatarUploadMiddleware, updateAvatar);

export default router;
