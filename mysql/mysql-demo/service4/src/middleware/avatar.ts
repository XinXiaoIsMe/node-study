import type { ExpressMiddleware } from '@inversifyjs/http-express';
import type { NextFunction, Request, Response } from 'express';
import { injectable } from 'inversify';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB 限制
  },
});

@injectable()
export class AvatarParserMiddle implements ExpressMiddleware {
  execute(req: Request, res: Response, next: NextFunction) {
    upload.single('avatar')(req, res, next);
  }
}
