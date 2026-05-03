import fs from 'node:fs';
import { env } from '@/env';

const dbPassword = env.DB_PASSWORD_FILE
    ? fs.readFileSync(env.DB_PASSWORD_FILE, 'utf8').trim()
    : process.env.DB_PASSWORD;

const DB_URL = `postgresql://${env.DB_USER}:${dbPassword}@${env.DB_HOST}:5432/${env.DB_NAME}`;
const WITHINGS_REDIRECT_URI = new URL(
    '/api/withings/callback',
    env.APP_URL
).toString();

const WITHINGS_SIGNATURE_URL = 'https://wbsapi.withings.net/v2/signature';
const WITHINGS_OAUTH_URL = 'https://wbsapi.withings.net/v2/oauth2';
const WITHINGS_AUTHORIZATION_URL =
    'https://account.withings.com/oauth2_user/authorize2';
const WITHINGS_HEART_URL = 'https://wbsapi.withings.net/v2/heart';

export {
    WITHINGS_REDIRECT_URI,
    WITHINGS_SIGNATURE_URL,
    WITHINGS_OAUTH_URL,
    WITHINGS_AUTHORIZATION_URL,
    WITHINGS_HEART_URL,
    DB_URL,
};
