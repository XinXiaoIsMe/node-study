import express from 'express'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import taskRoutes from './routes/taskRoutes'
import { corsMiddleware } from './middleware/cors'
import { attachSession } from './middleware/auth'
import { pool } from './database'

const app = express()

app.use(express.json())
// 处理跨域
app.use(corsMiddleware)
// 在req上绑定session信息
app.use(attachSession)

app.use('/api', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/tasks', taskRoutes)

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok' })
  } catch (error) {
    console.error('Health check failed:', error)
    res.status(500).json({ status: 'error' })
  }
})

export default app
