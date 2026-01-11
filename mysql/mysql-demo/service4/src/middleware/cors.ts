import type { ExpressMiddleware } from '@inversifyjs/http-express';
import type { NextFunction, Request, Response } from 'express';
import { env } from '@config/env';
import cors from 'cors';
import { injectable } from 'inversify';

export const corsMiddleware = cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
});

@injectable()
export class CorsMiddleware implements ExpressMiddleware {
  execute(req: Request, res: Response, next: NextFunction) {
    corsMiddleware(req, res, next);
  }
}
