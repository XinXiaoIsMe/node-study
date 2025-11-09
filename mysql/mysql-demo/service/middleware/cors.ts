import type { NextFunction, Request, Response } from 'express'

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const allowOrigin = process.env.CORS_ORIGIN ?? '*'
  res.header('Access-Control-Allow-Origin', allowOrigin)
  if (allowOrigin !== '*') {
    res.header('Access-Control-Allow-Credentials', 'true')
  }
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  )
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')

  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }
  next()
}
