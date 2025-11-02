import type { Request, Response } from 'express'
import { createUser } from '../models/userModel'
import type { Role } from '../types/session'

export const createUserController = async (req: Request, res: Response) => {
  const { username, password, nickname = null, role = 'user' } = req.body ?? {}

  if (!username || !password) {
    res.status(400).json({ message: '用户名和密码不能为空' })
    return
  }

  const normalizedRole: Role = role === 'admin' ? 'admin' : 'user'

  try {
    const insertId = await createUser({
      username,
      password,
      nickname,
      role: normalizedRole,
    })

    res.status(201).json({
      message: '用户创建成功',
      user: {
        id: insertId,
        username,
        nickname,
        role: normalizedRole,
      },
    })
  } catch (error) {
    const err = error as { code?: string }
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: '用户名已存在' })
      return
    }

    console.error('Create user failed:', error)
    res.status(500).json({ message: '服务器错误，请稍后重试' })
  }
}
