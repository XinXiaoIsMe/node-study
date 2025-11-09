import type { NextFunction, Request, Response } from 'express'
import { getSession } from '../models/sessionStore'

const pickToken = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? trimmed : null
  }
  if (Array.isArray(value)) {
    return pickToken(value.find((item) => typeof item === 'string'))
  }
  return null
}

const extractToken = (req: Request): string | null => {
  const authHeader = req.header('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) {
    const queryToken =
      pickToken((req.query as Record<string, unknown>).token) ??
      pickToken((req.query as Record<string, unknown>).access_token)
    return queryToken
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
