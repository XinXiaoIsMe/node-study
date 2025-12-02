import { Router } from "express";

const router = Router();
router.post('/login', (req, res, next) => {
    res.json({
        message: '登录成功！'
    })
});

export default router;
