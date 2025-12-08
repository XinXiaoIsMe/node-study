import { Request, Response } from "express";
import multer from 'multer';
import sharp from 'sharp';
import { findUserProfileById, getUserAvatar, updateUserProfile, updateUserAvatar } from '../models/userModel';
import { updateSession } from "../models/sessionStore";
import { normalizeGender } from '../utils/user';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB 限制
  },
});
// 解析文件的中间件
export const avatarUploadMiddleware = upload.single('avatar');

export async function getProfile(req: Request, res: Response) {
    if (!req.session) return;

    const profile = await findUserProfileById(req.session.userId);
    if (!profile) {
        res.status(404).json({ message: '用户不存在' })
        return
    }

    res.json({ profile })
}

export async function updateProfile(req: Request, res: Response) {
    if (!req.session) return;

    const { nickname = null, gender = null, selfIntro = null } = req.body ?? {};
    const normalizedGender = normalizeGender(gender);
    const success = await updateUserProfile(req.session.userId, {
        gender: normalizedGender,
        nickname,
        selfIntro,
    });
    if (!success) {
        res.status(500).json({ message: '更新失败，请稍后重试' })
        return
    }

    const profile = await findUserProfileById(req.session.userId);
    updateSession(req.session.token, {
        nickname: profile?.nickname ?? req.session.nickname,
        gender: profile?.gender ?? req.session.gender ?? null,
        selfIntro: profile?.selfIntro ?? req.session.selfIntro ?? null,
        avatarUpdatedAt: profile?.avatarUpdatedAt ?? req.session.avatarUpdatedAt ?? null,
    });
    res.json({ profile });
}

export async function getAvatar(req: Request, res: Response) {
    if (!req.session) return;

    const avatar = await getUserAvatar(req.session.userId);
    if (!avatar) {
        res.status(404).json({ message: '未上传头像' });
        return;
    }

    res.setHeader('Content-Type', avatar.mime);
    res.send(avatar.data);
}

export async function updateAvatar(req: Request, res: Response) {
    if (!req.session) return;

    if (!req.file) {
        res.status(400).json({ message: '请上传头像文件' })
        return
    }

    try {
        const userId = req.session.userId;
        const token = req.session.token;
        // 获取压缩头像
        const compressed = await sharp(req.file.buffer)
            .rotate()
            .resize(320, 320, { fit: 'inside' })
            .jpeg({ quality: 80 })
            .toBuffer();
        
        // 更新数据库
        await updateUserAvatar(userId, {
            data: compressed,
            mime: 'image/jpeg',
            size: compressed.length
        });

        const profile = await findUserProfileById(userId);
        updateSession(token, {
            avatarUpdatedAt: profile?.avatarUpdatedAt ?? new Date().toISOString()
        });
        res.json({
            message: '头像已更新',
            profile
        });
    } catch (error) {
        console.error('compress avatar failed:', error)
        res.status(500).json({ message: '头像上传失败，请重试' })
    }
}
