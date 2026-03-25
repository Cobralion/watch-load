import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

export const env = createEnv({
    server: {
        DATABASE_URL: z.url(),
        AUTH_SECRET: z.string().min(1),
        ENCRYPTION_KEY: z.string().length(64),
        JWT_APP_ISSUER: z.string().min(1),
        JWT_APP_AUDIENCE: z.string().min(1),
        JWT_SECRET: z.string().min(1),
        WITHINGS_CLIENT_ID: z.string().min(1),
        WITHINGS_CLIENT_SECRET: z.string().min(1),
        WITHINGS_REDIRECT_URI: z.url(),
    },
    experimental__runtimeEnv: process.env,
});
