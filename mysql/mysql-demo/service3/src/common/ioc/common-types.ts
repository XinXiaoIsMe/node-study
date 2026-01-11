export const MIDDLEWARES = {
  CorsMiddleware: Symbol('CorsMiddleware'),
  ResponseMiddleware: Symbol('ResponseMiddleware'),
} as const;

export const TYPES = {
  PrismaDb: 'PrismaDb',
} as const;
