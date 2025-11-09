import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { pool } from '../database'
import type { Role } from '../types/session'

interface CreateUserInput {
  username: string
  password: string
  nickname: string | null
  role: Role
  avatar?: {
    data: Buffer
    mime: string
    size: number
  } | null
}

export const createUser = async ({
  username,
  password,
  nickname,
  role,
  avatar,
}: CreateUserInput) => {
  const columns = ['username', 'password', 'nickname', 'role']
  const placeholders = ['?', '?', '?', '?']
  const values: Array<string | Role | Buffer | number | null> = [username, password, nickname, role]

  if (avatar && avatar.data.length > 0) {
    columns.push('avatar', 'avatar_mime', 'avatar_size')
    placeholders.push('?', '?', '?')
    values.push(avatar.data, avatar.mime, avatar.size)
  }

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO users (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`,
    values,
  )
  return result.insertId
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

export interface UserProfile {
  id: number
  username: string
  nickname: string | null
  gender: number | null
  selfIntro: string | null
  role: Role
  avatarUpdatedAt: string | null
}

export const findUserProfileById = async (userId: number): Promise<UserProfile | null> => {
  const [rows] = await pool.execute<UserProfileRow[]>(
    `SELECT
       id,
       username,
       nickname,
       gender,
       self_intro,
       role,
       avatar_size,
       update_time
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId],
  )

  if (!rows.length) {
    return null
  }

  const row = rows[0]
  const avatarUpdatedAt =
    row.avatar_size && row.update_time ? new Date(row.update_time).toISOString() : null
  const normalizedGender = row.gender && row.gender > 0 ? row.gender : null

  return {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    gender: normalizedGender,
    selfIntro: row.self_intro ?? null,
    role: row.role,
    avatarUpdatedAt,
  }
}

export const updateUserProfile = async (
  userId: number,
  payload: {
    nickname: string | null
    gender: number | null
    selfIntro: string | null
  },
) => {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE users
     SET nickname = ?, gender = ?, self_intro = ?, update_time = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [payload.nickname, payload.gender, payload.selfIntro, userId],
  )
  return result.affectedRows > 0
}

interface AvatarRow extends RowDataPacket {
  avatar: Buffer | null
  avatar_mime: string | null
}

export const updateUserAvatar = async (userId: number, params: { data: Buffer; mime: string; size: number }) => {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE users
     SET avatar = ?, avatar_mime = ?, avatar_size = ?, update_time = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [params.data, params.mime, params.size, userId],
  )
  return result.affectedRows > 0
}

export const clearUserAvatar = async (userId: number) => {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE users
     SET avatar = NULL, avatar_mime = NULL, avatar_size = NULL, update_time = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [userId],
  )
  return result.affectedRows > 0
}

export const getUserAvatar = async (userId: number) => {
  const [rows] = await pool.execute<AvatarRow[]>(
    'SELECT avatar, avatar_mime FROM users WHERE id = ? LIMIT 1',
    [userId],
  )
  if (!rows.length || !rows[0].avatar) {
    return null
  }
  return {
    data: rows[0].avatar,
    mime: rows[0].avatar_mime ?? 'image/png',
  }
}

export const ensureAdminAccount = async () => {
  await pool.execute(
    `INSERT INTO users (username, password, nickname, role)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       password = VALUES(password),
       nickname = VALUES(nickname),
       role = VALUES(role)`,
    ['admin', '123456', '系统管理员', 'admin'],
  )
}
