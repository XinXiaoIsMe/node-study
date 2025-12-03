import express from 'express';
import { requireAuth } from '../middleware/auth';
import { getProfile, updateProfile, getAvatar } from '../controllers/userController';

const router = express.Router();

router.get('/me', requireAuth, getProfile);
router.put('/me', requireAuth, updateProfile);
router.get('/me/avatar', requireAuth, getAvatar);

export default router;
