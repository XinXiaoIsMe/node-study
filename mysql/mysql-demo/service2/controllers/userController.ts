import { Request, Response } from "express";
import { findUserProfileById, getUserAvatar, updateUserProfile } from '../models/userModel';
import { updateSession } from "../models/sessionStore";
import { normalizeGender } from '../utils/user';

export async function getProfile(req: Request, res: Response) {
    if (!req.session) return;

    const profile = await findUserProfileById(req.session.userId);
    if (!profile) {
        res.status(404).json({ message: '用户不存在' })
        return
    }

    res.json({ profile })
}

export async function updateProfile (req: Request, res: Response) {
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

export async function getAvatar (req: Request, res: Response) {
    if (!req.session) return;

    const avatar = await getUserAvatar(req.session.userId);
    if (!avatar) {
        res.status(404).json({ message: '未上传头像' });
        return;
    }

    res.setHeader('Content-Type', avatar.mime);
    res.send(avatar.data);
}
