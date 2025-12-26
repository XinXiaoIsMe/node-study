export const AUTH_TYPES = {
  AuthService: Symbol('auth/AuthService'),
  AuthRepository: Symbol('auth/AuthRepository'),
} as const;

export const AUTH_MIDDLEWARES = {
  LoginValidator: Symbol('auth/LoginValidator'),
  AuthMiddleware: Symbol('auth/AuthMiddleware'),
} as const;
