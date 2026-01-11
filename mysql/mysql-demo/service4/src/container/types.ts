export const TYPES = {
  PrismaDb: Symbol('PrismaDb'),
  Cors: Symbol('cors'),
  Auth: Symbol('auth'),
  // auth
  AuthService: Symbol('auth/AuthService'),
  AuthRepository: Symbol('auth/AuthRepository'),
  RefreshTokenRepository: Symbol('auth/RefreshTokenRepository'),
  // user
  UserService: Symbol('user/UserService'),
  UserRepository: Symbol('user/UserRepository'),
} as const;
