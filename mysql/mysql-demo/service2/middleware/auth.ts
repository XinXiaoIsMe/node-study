import { Request, Response, NextFunction } from "express";
import { getSession } from "../models/sessionStore";
import { getTokenFromReqHeader } from "../utils/auth";

/**
 * 在req上添加session信息
 * @param req Request
 * @param _res Response
 * @param next NextFunction
 */
export function attachSession(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    const session = getSession(token);
    if (session) {
      req.session = { ...session, token };
    }
  }
  next();
}

/**
 * 判断请求是否授权
 * @param req Request
 * @param _res Response
 * @param next NextFunction
 */
export function requireAuth (req: Request, res: Response, next: NextFunction) {
  if (!req.session) {
    res.status(401).json({ message: '未授权' });
    return;
  }
  next();
}

/**
 * 获取token
 * @param req 
 */
function extractToken(req: Request) {
  // 从请求头中获取token
  const token = getTokenFromReqHeader(req);
  // 如果请求头中不存在token信息，则尝试从query中查看
  if (!token) {
    const queryToken =
      pickToken((req.query as Record<string, unknown>).token) ??
      pickToken((req.query as Record<string, unknown>).access_token)
    return queryToken;
  }
  return token;
}

function pickToken(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? trimmed : null
  }
  if (Array.isArray(value)) {
    return pickToken(value.find((item) => typeof item === 'string'))
  }
  return null
}
