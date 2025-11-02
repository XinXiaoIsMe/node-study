export type Role = 'user' | 'admin'

export interface SessionData {
  userId: number
  username: string
  nickname: string | null
  role: Role
  lastSeen: number
}

export interface AuthenticatedSession extends SessionData {
  token: string
}
