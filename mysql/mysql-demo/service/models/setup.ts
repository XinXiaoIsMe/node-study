import { pool } from '../database'
import { ensureAdminAccount } from './userModel'

export const ensureUsersTable = async () => {
  const connection = await pool.getConnection()
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
        username VARCHAR(32) NOT NULL COMMENT '登录名',
        nickname VARCHAR(32) COMMENT '昵称',
        gender TINYINT DEFAULT 0 COMMENT '性别',
        password VARCHAR(32) NOT NULL COMMENT '密码',
        avatar LONGBLOB COMMENT '头像',
        avatar_mime VARCHAR(64) COMMENT '头像mime类型',
        avatar_size INT UNSIGNED COMMENT '头像大小字节',
        self_intro VARCHAR(255) COMMENT '自我介绍',
        role ENUM('user','admin') NOT NULL DEFAULT 'user' COMMENT '角色 user=普通用户 admin=系统管理员',
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
      )
    `)

    try {
      await connection.query(
        "ALTER TABLE users ADD COLUMN role ENUM('user','admin') NOT NULL DEFAULT 'user' COMMENT '角色 user=普通用户 admin=系统管理员' AFTER self_intro",
      )
    } catch (error) {
      const err = error as { code?: string }
      if (err.code !== 'ER_DUP_FIELDNAME') {
        throw error
      }
    }

    try {
      await connection.query(
        'ALTER TABLE users ADD UNIQUE KEY uk_users_username (username)',
      )
    } catch (error) {
      const err = error as { code?: string }
      if (err.code === 'ER_DUP_ENTRY') {
        console.warn(
          '存在重复的用户名，未能创建唯一索引 uk_users_username，请手动清理重复数据后重试。',
        )
      } else if (err.code !== 'ER_DUP_KEYNAME') {
        throw error
      }
    }
  } finally {
    connection.release()
  }
}

export const ensureTasksTable = async () => {
  const connection = await pool.getConnection()
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '任务ID',
        title VARCHAR(120) NOT NULL COMMENT '任务标题',
        description TEXT COMMENT '任务描述',
        due_date DATETIME NULL COMMENT '截止时间',
        priority ENUM('low','medium','high') NOT NULL DEFAULT 'medium' COMMENT '优先级',
        status ENUM('pending','completed') NOT NULL DEFAULT 'pending' COMMENT '状态',
        created_by BIGINT UNSIGNED NOT NULL COMMENT '创建人ID',
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_tasks_creator (created_by),
        INDEX idx_tasks_status (status)
      )
    `)
  } finally {
    connection.release()
  }
}

export const initializeDatabase = async () => {
  await ensureUsersTable()
  await ensureTasksTable()
  await ensureAdminAccount()
}
