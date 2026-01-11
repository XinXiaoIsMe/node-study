export const TYPES = {
  PrismaDb: Symbol('PrismaDb'),
  Cors: Symbol('cors'),
  Auth: Symbol('auth'),
  AdminValidator: Symbol('AdminValidator'),
  // auth
  AuthService: Symbol('auth/AuthService'),
  AuthRepository: Symbol('auth/AuthRepository'),
  RefreshTokenRepository: Symbol('auth/RefreshTokenRepository'),
  // user
  UserService: Symbol('user/UserService'),
  UserRepository: Symbol('user/UserRepository'),
  AvatarParser: Symbol('user/AvatarParser'),
  // task
  TaskService: Symbol('task/TaskService'),
  TaskRepository: Symbol('task/TaskRepository'),
} as const;
