export const AUTH_TYPES = {
    AuthService: Symbol('auth/AuthService'),
    AuthRepository: Symbol('auth/AuthRepository')
} as const;

export const AUTH_VALIDATORS = {
    LoginValidator: Symbol('auth/LoginValidator')
} as const;
