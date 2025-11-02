import mysql, { Pool } from 'mysql2/promise'
import { appConfig } from './config'

export const pool: Pool = mysql.createPool({
  host: appConfig.db.host,
  port: appConfig.db.port,
  user: appConfig.db.user,
  password: appConfig.db.password,
  database: appConfig.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export type DbConnection = mysql.PoolConnection
