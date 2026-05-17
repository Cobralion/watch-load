import { createEnv } from '@t3-oss/env-nextjs';

export const envClient = createEnv({
    client: {},
    runtimeEnv: {},
    skipValidation: process.env.SKIP_ENV_VALIDATION === '1',
});
