import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import type { Role } from "../types/session";
import { pool } from '../database';
import { getTokenFromReqHeader } from '../utils/auth';
import { createSession, deleteSession, deleteSessionsByUser } from "../models/sessionStore";
import { getAvatarUpdatedTime, normalizeGender, normalizeRole } from "../utils/user";

interface UserRow extends RowDataPacket {
    id: number
    username: string
    nickname: string | null
    password: string
    role: Role
    gender: number | null
    self_intro: string | null
    avatar_size: number | null
    avatar_mime: string | null
    update_time: Date | null
}

export async function login(req: Request, res: Response) {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
        res.status(400).json({ message: '用户名和密码不能为空' })
        return
    }

    try {
        const [rows] = await pool.execute<UserRow[]>(`
        SELECT
            id,
            username,
            nickname,
            password,
            role,
            gender,
            self_intro,
            avatar_size,
            avatar_mime,
            update_time
        FROM
            users
        WHERE
            username = ?
        LIMIT 1
    `, [username]);

        if (!rows.length || rows[0].password !== password) {
            res.status(401).json({ message: '用户名或密码错误' });
            return;
        }

        const user = rows[0];
        // 删除session中的原用户信息
        deleteSessionsByUser(user.id);

        // 头像更新时间
        const avatarUpdatedAt = getAvatarUpdatedTime(user);
        // 格式化性别
        const normalizedGender = normalizeGender(user.gender);
        // 格式化角色
        const normalizedRole = normalizeRole(user.role);

        // 创建新的session并缓存
        const token = createSession({
            avatarUpdatedAt,
            userId: user.id,
            username: user.username,
            nickname: user.nickname,
            gender: normalizedGender,
            selfIntro: user.self_intro ?? null,
            role: normalizedRole,
        });

        res.json({
            token,
            message: '登录成功',
            user: {
                avatarUpdatedAt,
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                gender: normalizedGender,
                role: normalizedRole,
                selfIntro: user.self_intro ?? null,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服务器错误，请稍后重试' });
    }
}

export function logout (req: Request, res: Response) {
    // 如果req上session存在，则直接删除
    if (req.session) {
        deleteSession(req.session.token);
    } else {
        // 从请求头中获取token
        const token = getTokenFromReqHeader(req);
        token && deleteSession(token);
    }

    res.json({
        message: '已退出登录'
    });
}
