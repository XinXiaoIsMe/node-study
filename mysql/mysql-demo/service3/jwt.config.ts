export const jwtConfig = {
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ?? '1h'
} as const;