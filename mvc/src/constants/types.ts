export const TYPES = {
    PrismaDb: Symbol.for('PrismaDb'),
    UserRepository: Symbol.for('UserRepository'),
    UserService: Symbol.for('UserService')
} as const;

export const MIDDLEWARES = {
    ValidateCreateUser: Symbol.for('ValidateCreateUser'),
    ValidateUpdateUser: Symbol.for('ValidateUpdateUser')
} as const;
