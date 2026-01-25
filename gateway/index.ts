import caching from '@fastify/caching'; // 缓存技术
import proxy from '@fastify/http-proxy';
import rateLimit from '@fastify/rate-limit'; // 限流技术
import fastify from 'fastify';
import CircuitBreaker from 'opossum'; // 熔断技术
import { cachingConfig, proxyConfig, rateLimitConfig } from './config';

const app = fastify({
  logger: false,
});

const breaker = new CircuitBreaker((url: string) => {
  return fetch(url).then(res => res.json()); // 检测服务是否挂掉
});

app.register(rateLimit, rateLimitConfig); // 注册限流
app.register(caching, cachingConfig);// 注册缓存服务

proxyConfig.forEach(({ upstream, prefix, rewritePrefix, httpMethods }) => {
  app.register(proxy, {
    // 请求代理服务之前触发熔断
    preHandler: (_request, reply, done) => {
      // 检测这个服务 如果服务挂掉立马熔断
      breaker.fire(upstream).then(() => done()).catch(() => reply.code(503).send('Circuit breaker tripped'));
    },
    upstream,
    prefix,
    rewritePrefix,
    httpMethods,
  });
});

app.listen({
  port: 3000,
}).then(() => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on 3000`);
});
