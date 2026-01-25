const proxyConfig = [
  {
    upstream: 'http://localhost:9001', // 代理地址
    prefix: '/pc', // 前缀
    rewritePrefix: '', // 实际请求将pc 替换成 '' 因为后端服务器没有pc这个路由
    httpMethods: ['GET', 'POST'], // 允许的请求方式
  },
  {
    upstream: 'http://localhost:9002',
    prefix: '/mobile',
    rewritePrefix: '',
    httpMethods: ['GET', 'POST'],
  },
];

const rateLimitConfig = {
  max: 5, // 每 1 分钟最多允许 5 次请求
  timeWindow: '1 minute', // 一分钟
};

const cachingConfig = {
  privacy: 'private', // 缓存客户端服务器 禁止缓存代理服务器
  expiresIn: 10000, // 缓存10s
};

export {
  cachingConfig,
  proxyConfig,
  rateLimitConfig,
};
