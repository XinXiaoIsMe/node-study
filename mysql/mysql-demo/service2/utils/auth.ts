import { Request } from "express";

/**
 * 从请求头中获取token信息
 * @param req Request
 * @returns token信息
 */
export function getTokenFromReqHeader (req: Request) {
    const authHeader = req.header('Authorization') ?? '';
    const token = authHeader.slice(7).trim();
    return token;
}