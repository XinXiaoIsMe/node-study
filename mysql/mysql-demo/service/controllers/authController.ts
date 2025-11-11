import type { Request, Response } from 'express'
import type { RowDataPacket } from 'mysql2/promise'
import { pool } from '../database'
import { createSession, deleteSession, deleteSessionsByUser } from '../models/sessionStore'
import type { Role } from '../types/session'

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

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body ?? {}

  if (!username || !password) {
    res.status(400).json({ message: '用户名和密码不能为空' })
    return
  }

  try {
    const [rows] = await pool.execute<UserRow[]>(
      `SELECT
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
       FROM users
       WHERE username = ?
       LIMIT 1`,
      [username],
    )

    if (!rows.length || rows[0].password !== password) {
      res.status(401).json({ message: '用户名或密码错误' })
      return
    }

    const user = rows[0]
    deleteSessionsByUser(user.id)

    const avatarUpdatedAt =
      user.avatar_size && user.update_time
        ? new Date(user.update_time).toISOString()
        : null
    const normalizedGender =
      user.gender && user.gender > 0 ? user.gender : null

    const token = createSession({
      userId: user.id,
      username: user.username,
      nickname: user.nickname,
      gender: normalizedGender,
      selfIntro: user.self_intro ?? null,
      avatarUpdatedAt,
      role: user.role === 'admin' ? 'admin' : 'user',
    })

    res.json({
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        gender: normalizedGender,
        selfIntro: user.self_intro ?? null,
        avatarUpdatedAt,
        role: user.role === 'admin' ? 'admin' : 'user',
      },
      token,
    })
  } catch (error) {
    console.error('Login failed:', error)
    res.status(500).json({ message: '服务器错误，请稍后重试' })
  }
}

export const logout = (req: Request, res: Response) => {
  if (req.session) {
    deleteSession(req.session.token)
  } else {
    const authHeader = req.header('Authorization') ?? ''
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim()
      deleteSession(token)
    }
  }
  res.json({ message: '已退出登录' })
}
