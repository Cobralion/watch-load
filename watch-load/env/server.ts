import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

export const env = createEnv({
    server: {
        NODE_ENV: z.enum(['development', 'production', 'test']),
        APP_URL: z.url(),
        DB_USER: z.string().min(1),
        DB_PASSWORD: z.string().min(1),
        DB_HOST: z.string().min(1),
        DB_PORT: z.string().min(1),
        DB_NAME: z.string().min(1),
        AUTH_SECRET: z.string().min(1),
        ENCRYPTION_KEY: z.string().length(64),
        JWT_APP_ISSUER: z.string().min(1),
        JWT_APP_AUDIENCE: z.string().min(1),
        JWT_SECRET: z.string().min(1),
        WITHINGS_CLIENT_ID: z.string().min(1),
        WITHINGS_CLIENT_SECRET: z.string().min(1),
    },
    experimental__runtimeEnv: process.env,
    skipValidation: process.env.SKIP_ENV_VALIDATION === '1',
});
