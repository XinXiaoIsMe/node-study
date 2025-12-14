export const TYPES = {
    PrismaDb: Symbol.for('PrismaDb'),
    UserRepository: Symbol.for('UserRepository'),
    UserService: Symbol.for('UserService'),
    PostRepository: Symbol.for('PostRepository'),
    PostService: Symbol.for('PostService')
} as const;

export const MIDDLEWARES = {
    ValidateCreateUser: Symbol.for('ValidateCreateUser'),
    ValidateUpdateUser: Symbol.for('ValidateUpdateUser')
} as const;
