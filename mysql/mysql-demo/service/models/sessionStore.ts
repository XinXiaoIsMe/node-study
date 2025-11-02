import crypto from 'node:crypto'
import type { SessionData } from '../types/session'

const sessions = new Map<string, SessionData>()

export const createSession = (data: Omit<SessionData, 'lastSeen'>): string => {
  const token = crypto.randomBytes(24).toString('hex')
  sessions.set(token, { ...data, lastSeen: Date.now() })
  return token
}

export const getSession = (token: string) => {
  const session = sessions.get(token)
  if (!session) {
    return null
  }
  session.lastSeen = Date.now()
  return session
}

export const deleteSession = (token: string) => {
  sessions.delete(token)
}

export const deleteSessionsByUser = (userId: number) => {
  for (const [token, session] of sessions.entries()) {
    if (session.userId === userId) {
      sessions.delete(token)
    }
  }
}
