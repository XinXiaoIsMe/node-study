import { Request, Response } from "express";
import multer from 'multer';
import sharp from 'sharp';
import type { Role } from '../types/session';
import { findUserProfileById, getUserAvatar, updateUserProfile, updateUserAvatar, createUser, listUsers, deleteUser, updateUser } from '../models/userModel';
import { updateSession } from "../models/sessionStore";
import { normalizeGender, normalizeRole } from '../utils/user';

const MAX_BASE64_AVATAR_SIZE = 2 * 1024 * 1024
const parseBase64Avatar = (input: unknown) => {
  if (typeof input !== 'string' || !input) {
    return null
  }
  const match = input.match(/^data:(.+);base64,(.+)$/)
  if (!match) {
    return null
  }
  const mime = match[1]
  if (!mime.startsWith('image/')) {
    return null
  }
  const buffer = Buffer.from(match[2], 'base64')
  if (buffer.length > MAX_BASE64_AVATAR_SIZE) {
    throw new Error('AvatarTooLarge')
  }
  return {
    data: buffer,
    mime,
    size: buffer.length,
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB 限制
  },
});
// 解析文件的中间件
export const avatarUploadMiddleware = upload.single('avatar');

export async function getUserController (req: Request, res: Response) {
    if (!req.session) return;

    try {
        const users = await listUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: '用户信息查询失败' });
    }
}

export async function deleteUserController (req: Request, res: Response) {
    if (!req.session) return;

    const userId = Number(req.params?.userId);
    if (!userId || Number.isNaN(userId)) {
        res.status(400).json({
            message: '用户ID格式错误'
        });
        return;
    }

    try {
        const deleted = await deleteUser(userId);
        if (!deleted) {
            res.status(400).json({
                message: '删除用户失败！'
            });
            return;
        }
        res.status(200).json({ message: '删除用户成功！' });
    } catch (error) {
        res.status(400).json({
            message: '删除用户失败!'
        });
    }
}

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
    const userId = Number(req.query.userId ?? req.session?.userId);
    if (!userId || Number.isNaN(userId)) {
        res.status(400).json({
            message: '用户id格式不正确'
        });
        return;
    }

    const avatar = await getUserAvatar(userId);
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

export async function createUserController (req: Request, res: Response) {
    if (!req.session) return;

    const {
        username,
        password,
        nickname = null,
        role = 'user',
        gender = null,
        avatar: avatarBase64,
        self_intro = null
    } = req.body ?? {};

    const normalizedRole: Role = normalizeRole(role);
    let avatarPayload: ReturnType<typeof parseBase64Avatar> = null;

    if (avatarBase64) {
        try {
            avatarPayload = parseBase64Avatar(avatarBase64);
            if (!avatarPayload) {
                res.status(400).json({
                    message: '头像格式不正确，请上传 JPG 或 PNG 图片'
                });
                return;
            }
        } catch (error) {
            if ((error as Error).message === 'AvatarTooLarge') {
                res.status(400).json({ message: '头像大小请控制在 2MB 以内' });
            } else {
                res.status(400).json({ message: '头像格式不正确，请重新上传' })
            }
            return;
        }
    }

    try {
        const insertId = await createUser({
            username,
            password,
            nickname,
            gender,
            self_intro,
            role: normalizedRole,
            avatar: avatarPayload,
        });
        res.status(201).json({
            message: '用户创建成功！',
            user: {
                id: insertId,
                username,
                nickname,
                role: normalizedRole
            }
        });
    } catch (error) {
        const err = error as { code?: string };
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ message: '用户名已存在' });
            return;
        }

        console.error('Create user failed:', error);
        res.status(500).json({ message: '服务器错误，请稍后重试' });
    }
}

export async function updateUserController (req: Request, res: Response) {
    const {
        userId: id,
        username,
        nickname,
        gender = 0,
        role = 'user',
        self_intro = '',
    } = req.body ?? {};

    const userId = Number(id);

    if (!userId || Number.isNaN(userId)) {
        res.status(400).json({ message: 'userId不合法' });
        return;
    }

    if (!username) {
        res.status(400).json({ message: '用户名不合法' });
        return;
    }

    try {
        const updated = await updateUser(userId, {
            username,
            nickname,
            gender,
            role,
            self_intro
        });
        if (!updated) {
            res.status(400).json({ message: '修改用户信息失败' });
            return;
        }

        res.status(200).json({ message: '修改用户信息成功' });
    } catch (error) {
        res.status(400).json({ message: '服务器错误，请稍后重试' });
    }
}
