import type { NextFunction, Request, Response } from 'express'
import { getSession } from '../models/sessionStore'

const extractToken = (req: Request): string | null => {
  const authHeader = req.header('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.slice(7).trim()
  return token || null
}

export const attachSession = (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req)
  if (token) {
    const session = getSession(token)
    if (session) {
      req.session = { ...session, token }
    }
  }
  next()
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session) {
    res.status(401).json({ message: '未授权' })
    return
  }
  next()
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session) {
    res.status(401).json({ message: '未授权' })
    return
  }
  if (req.session.role !== 'admin') {
    res.status(403).json({ message: '无权限操作' })
    return
  }
  next()
}
