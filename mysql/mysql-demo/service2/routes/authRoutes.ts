import { Router } from "express";
import { login, logout } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.post('/login', login);
router.post('/logout', requireAuth, logout);

export default router;
