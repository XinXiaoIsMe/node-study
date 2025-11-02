import app from './app'
import { pool } from './database'
import { initializeDatabase } from './models/setup'

const PORT = Number(process.env.PORT ?? 3000)
let server: ReturnType<typeof app.listen> | null = null

const startServer = async () => {
  try {
    console.log('连接数据库中')
    await initializeDatabase()
    server = app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

const shutdown = () => {
  const closePool = () =>
    pool
      .end()
      .catch((error) => {
        console.error('Failed to close MySQL pool:', error)
      })
      .finally(() => {
        process.exit(0)
      })

  if (server) {
    server.close(() => {
      closePool()
    })
  } else {
    closePool()
  }
}

// 按下Ctrl+C时
process.on('SIGINT', shutdown)
// 监听系统或其他进程发出的“终止”信号
process.on('SIGTERM', shutdown)

startServer()
