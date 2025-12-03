import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from "../database";
import type { Role } from '../types/session';
import { getAvatarUpdatedTime, normalizeGender } from '../utils/user';

export interface UserProfile {
    id: number
    username: string
    nickname: string | null
    gender: number | null
    selfIntro: string | null
    role: Role
    avatarUpdatedAt: string | null
}

interface UserProfileRow extends RowDataPacket {
  id: number
  username: string
  nickname: string | null
  gender: number | null
  self_intro: string | null
  role: Role
  avatar_size: number | null
  update_time: Date | null
}

interface AvatarRow extends RowDataPacket {
    avatar: Buffer | null
    avatar_mime: string | null
}

export async function findUserProfileById(userId: number): Promise<UserProfile | null> {
    try {
        const [rows] = await pool.execute<UserProfileRow[]>(
            `
            SELECT
                id,
                username,
                nickname,
                gender,
                self_intro,
                role,
                avatar_size,
                update_time
            FROM
                users
            WHERE
                id = ?
            LIMIT 1
            `,
            [userId]
        );
        if (!rows.length) return null;

        const row = rows[0];
        const avatarUpdatedAt = getAvatarUpdatedTime(row);
        const normalizedGender = normalizeGender(row.gender);

        return {
            id: row.id,
            username: row.username,
            nickname: row.nickname,
            gender: normalizedGender,
            selfIntro: row.self_intro ?? null,
            role: row.role,
            avatarUpdatedAt,
        }
    } catch (error) {
        return null;
    }
}

export async function updateUserProfile (
    userId: number,
    payload: {
        nickname: string | null
        gender: number | null
        selfIntro: string | null
    }
) {
    const [result] = await pool.execute<ResultSetHeader>(
        `
            UPDATE users
            SET nickname = ?, gender = ?, self_intro = ?, update_time = CURRENT_TIMESTAMP
            WHERE id = ?
        `,
        [payload.nickname, payload.gender, payload.selfIntro, userId]
    );
    return result.affectedRows > 0;
}

export async function getUserAvatar(userId: number) {
    const [rows] = await pool.execute<AvatarRow[]>(
        `SELECT avatar, avatar_mime FROM users WHERE id = ? LIMIT 1`,
        [userId]
    );
    if (!rows.length || !rows[0].avatar) {
        return null;
    }
    return {
        data: rows[0].avatar,
        mime: rows[0].avatar_mime ?? 'image/png',
    }
}
