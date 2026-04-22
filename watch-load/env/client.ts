import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

export const envClient = createEnv({
    client: {
        NEXT_PUBLIC_MANUAL_CALLBACK: z
            .string()
            .transform((val) => val.toLowerCase() === 'true'),
    },
    runtimeEnv: {
        NEXT_PUBLIC_MANUAL_CALLBACK: process.env.NEXT_PUBLIC_MANUAL_CALLBACK,
    },
});
