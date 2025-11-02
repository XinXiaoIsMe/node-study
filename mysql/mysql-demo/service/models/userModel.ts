import type { ResultSetHeader } from 'mysql2/promise'
import { pool } from '../database'
import type { Role } from '../types/session'

interface CreateUserInput {
  username: string
  password: string
  nickname: string | null
  role: Role
}

export const createUser = async ({ username, password, nickname, role }: CreateUserInput) => {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO users (username, password, nickname, role) VALUES (?, ?, ?, ?)',
    [username, password, nickname, role],
  )
  return result.insertId
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
