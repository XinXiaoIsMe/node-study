import type { AuthenticatedSession } from './session'

declare global {
  namespace Express {
    interface Request {
      session?: AuthenticatedSession
    }
  }
}

export {}
