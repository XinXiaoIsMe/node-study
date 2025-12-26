import type { ExpressMiddleware } from '@inversifyjs/http-express';
import type { NextFunction, Request, Response } from 'express';
import { env } from '@config/env';
import { injectable } from 'inversify';

/**
 * 处理CORS的中间件
 */
@injectable()
export class CorsMiddleware implements ExpressMiddleware {
  execute(req: Request, res: Response, next: NextFunction) {
    CorsMiddleware.middleware(req, res, next);
  }

  static middleware(req: Request, res: Response, next: NextFunction) {
    const allowOrigin = env.CORS_ORIGIN ?? '*';
    // 设置允许跨域的源地址
    res.header('Access-Control-Allow-Origin', allowOrigin);
    if (allowOrigin !== '*') {
      /**
       * 允许浏览器在跨域请求中发送和接收“凭证”（Credentials）
       * 1. 仅在Access-Control-Allow-Origin不为*时可以设置为true
       * 2. 如果Access-Control-Allow-Origin不为*，则cookie（HTTP 认证信息（Authorization header）、TLS 客户端证书）等信息无法发送到后端
       */
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    // 设置跨域时可以传递的请求头
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    // 设置跨域时可以发送的请求类型
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');

    /**
     * 204 的含义是：
            “成功处理了请求，但响应体为空。”
            预检请求 不需要返回实际数据。
            还不应该让客户端等一个无意义的 body。
            选择 res.sendStatus(204) 有这些好处：
            ✔ 正确含义：成功 + 无内容
            更接近 OPTIONS 预检的语义。
            ✔ 比 200 更明确
            200 OK 也行，但 200 通常表示有正常响应内容。
            204 明确表达“这里没有内容，只是许可”。
            ✔ 避免浏览器误解析内容
            某些浏览器对 OPTIONS 的 body 会做额外检查，204 最安全。
            ✔ 符合 CORS 标准文档建议
            RFC 7231 对 OPTIONS 推荐使用 204 作为合适的响应。
     */
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      // 这里必须要返回，否则预检请求会到下一个中间件，导致报错
      return;
    }

    next();
  }
}
