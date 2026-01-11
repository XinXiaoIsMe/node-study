export const USER_TYPES = {
  UserService: Symbol('users/UserService'),
  UserRepository: Symbol('users/UserRepository'),
} as const;

export const USER_MIDDLEWARES = {
  AvatarMiddleware: Symbol('users/AvatarMiddleware'),
  UpdateAvatarValidator: Symbol('users/UpdateAvatarValidator'),
} as const;
