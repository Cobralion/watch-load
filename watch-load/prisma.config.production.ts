import { defineConfig } from 'prisma/config';
import fs from 'node:fs';

const dbPassword = process.env.DB_PASSWORD_FILE
    ? fs.readFileSync(process.env.DB_PASSWORD_FILE, 'utf8').trim()
    : process.env.DB_PASSWORD;

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        url: `postgresql://${process.env.DB_USER}:${dbPassword}@${process.env.DB_HOST}:5432/${process.env.DB_NAME}`,
    },
});
