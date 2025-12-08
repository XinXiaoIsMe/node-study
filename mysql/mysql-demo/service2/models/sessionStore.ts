import crypto from 'node:crypto';
import type { SessionData } from "../types/session";

const sessions = new Map<string, SessionData>();

export function createSession (data: Omit<SessionData, 'lastSeen'>) {
    const token = crypto.randomBytes(24).toString('hex');
    sessions.set(token, { ...data, lastSeen: Date.now() });
    return token;
}

export function deleteSessionsByUser (userId: number) {
    for (const [token, session] of sessions.entries()) {
        if (session.userId === userId) {
            sessions.delete(token);
        }
    }
}

export function getSession (token: string) {
    return sessions.get(token) ?? null;
}

export function deleteSession (token: string) {
    sessions.delete(token);
}

export function updateSession (
    token: string, 
    data: Partial<Omit<SessionData, 'userId' | 'lastSeen'>>
) {
    const session = getSession(token);
    if (!session) return null;

    sessions.set(token, {
        ...session,
        ...data,
        lastSeen: Date.now(),
    });
    return session;
}
