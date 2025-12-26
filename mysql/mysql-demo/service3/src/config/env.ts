import { z } from 'zod';

const envSchema = z.object({
    DATABASE_HOST: z.string(),
    DATABASE_USER: z.string(),
    DATABASE_PASSWORD: z.string(),
    DATABASE_NAME: z.string(),
    PORT: z.string().transform(port => Number(port)),
    JWT_SECRET: z.string(),
    JWT_ACCESS_TOKEN_EXPIRES_IN: z.string(),
});

export const env = envSchema.parse(process.env);
