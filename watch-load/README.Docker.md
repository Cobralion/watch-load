# Docker Deployment Guide

This guide covers everything you need to deploy watch-load with Docker Compose, including Postgres, automatic HTTPS via Caddy, and daily database backups.

---

## Architecture Overview

The production stack is defined in `compose.yaml` and consists of four services:

| Service | Image | Purpose |
|---|---|---|
| `watch-load` | Built from `Dockerfile` | Next.js app (port 3000, internal only) |
| `caddy` | `caddy:2` | Reverse proxy with automatic HTTPS (ports 80 / 443) |
| `db` | `postgres:16-alpine` | Postgres database (port 5432, internal only) |
| `db-backup` | `prodrigestivill/postgres-backup-local:16` | Automated daily Postgres backups |

The app never exposes port 3000 to the host. All traffic enters through Caddy, which terminates TLS and forwards requests to the `watch-load` container over the internal Docker network.

```
Internet → 80/443 → Caddy → :3000 → watch-load → :5432 → db
                                                         ↑
                                                     db-backup
```

---

## Prerequisites

- Docker Engine 24+ and Docker Compose v2
- A domain name pointed at your server (for automatic HTTPS)
- Ports 80 and 443 open on the host firewall

---

## First-Time Setup

### 1. Clone and enter the app directory

```bash
git clone <repo-url>
cd watch-load/watch-load
```

### 2. Create the environment file

Create an `.env` file:

```bash
touch .env
```

Open `.env` and set:

```dotenv
# Public URL and hostname (must match your domain)
APP_URL=https://your-domain.com
APP_HOSTNAME=your-domain.com

# Postgres connection details
DB_USER=postgres
DB_NAME=watch_load_db

# Path to the file that holds the database password (see step 3)
DB_PASSWORD_FILE=./db-password.txt

# NextAuth secret — generate with: openssl rand -base64 32
AUTH_SECRET=

# AES-256 encryption key for Withings tokens — must be 64 hex characters
# Generate with: openssl rand -hex 32
ENCRYPTION_KEY=

# Withings OAuth app credentials
WITHINGS_CLIENT_ID=
WITHINGS_CLIENT_SECRET=

# JWT signing secret — generate with: openssl rand -base64 32
JWT_SECRET=
```

> **Note:** `JWT_APP_ISSUER` and `JWT_APP_AUDIENCE` are set directly in `compose.yaml` (both default to `app`) and do not need to be in `.env`.

### 3. Create the database password secret

Docker Compose reads the database password from a plain-text file, keeping it out of environment variables:

```bash
# Generate a strong random password
openssl rand -base64 32 > db-password.txt

# Restrict file permissions
chmod 600 db-password.txt
```

The path to this file (`./db-password.txt`) must match `DB_PASSWORD_FILE` in `.env`.

### 4. Configure Caddy

The `Caddyfile` is already set up to read `APP_HOSTNAME` from the environment:

```caddyfile
{$APP_HOSTNAME} {
    reverse_proxy watch-load:3000
}
```

Caddy will automatically obtain and renew a TLS certificate via Let's Encrypt for whatever hostname you set. No further changes are needed unless you want to add custom headers, rate limiting, or other Caddy directives.

### 5. Start the stack

```bash
docker compose up -d --build
```

On the first run, Docker will:

1. Build the `watch-load` image (multi-stage build, ~2–4 minutes)
2. Pull `caddy:2`, `postgres:16-alpine`, and the backup image
3. Start all four services
4. Run `prisma migrate deploy` automatically before the app starts

Once healthy, the app is available at `https://your-domain.com`.

---

## Dockerfile Deep Dive

The `Dockerfile` uses a two-stage build to produce a minimal production image.

### Stage 1 — `builder` (oven/bun)

```dockerfile
FROM oven/bun:1 AS builder
```

- Installs all dependencies with `bun install --frozen-lockfile` (respects the lockfile exactly)
- Copies the full source and runs `next build`
- `SKIP_ENV_VALIDATION=1` prevents the env validation from running at build time (no secrets needed during image build)
- `NEXT_TELEMETRY_DISABLED=1` disables Next.js anonymous telemetry

### Stage 2 — `runner` (node:24)

```dockerfile
FROM node:24 AS runner
```

- Copies only the Next.js standalone output (`.next/standalone`), static assets, public files, and the Prisma schema — no source files, no dev dependencies
- Installs `prisma` CLI via npm so that `prisma migrate deploy` is available at startup
- Drops privileges to the unprivileged `node` user
- Copies `prisma.config.production.ts` as `prisma.config.ts` so the production Prisma config (which reads the DB password from a file) is active

### Startup command

```
npm run start:deploy
```

Which runs:

```
prisma migrate deploy && node server.js
```

Migrations are applied on every container start. This is safe because `migrate deploy` is idempotent — it only applies pending migrations.

---

## Environment Variables Reference

### Set in `.env`

| Variable | Required | Description |
|---|---|---|
| `APP_URL` | Yes | Full public URL, e.g. `https://your-domain.com` |
| `APP_HOSTNAME` | Yes | Bare hostname, e.g. `your-domain.com` (used by Caddy) |
| `DB_USER` | Yes | Postgres username |
| `DB_NAME` | Yes | Postgres database name |
| `DB_PASSWORD_FILE` | Yes | Path to the file containing the DB password |
| `AUTH_SECRET` | Yes | NextAuth session signing secret |
| `ENCRYPTION_KEY` | Yes | 64-hex-char AES-256 key for token encryption |
| `WITHINGS_CLIENT_ID` | Yes | Withings OAuth app client ID |
| `WITHINGS_CLIENT_SECRET` | Yes | Withings OAuth app client secret |
| `JWT_SECRET` | Yes | Secret for internal JWT signing |

### Hardcoded in `compose.yaml`

| Variable | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables Next.js production mode |
| `AUTH_TRUST_HOST` | `true` | Required when running behind a reverse proxy |
| `JWT_APP_ISSUER` | `app` | JWT issuer claim |
| `JWT_APP_AUDIENCE` | `app` | JWT audience claim |
| `DB_HOST` | `db` | Docker service name for Postgres |
| `DB_PASSWORD_FILE` | `/run/secrets/db-password` | Docker secret mount path (inside container) |

---

## Database Backups

The `db-backup` service runs `prodrigestivill/postgres-backup-local` and stores compressed dumps in `./backups/postgres/` on the host.

### Default retention policy

| Period | Copies kept |
|---|---|
| Daily | 14 |
| Weekly | 4 |
| Monthly | 6 |

Backups are gzip-compressed (`-Z9`) and scoped to the `public` schema. They run at midnight UTC (`@daily`).

### Manual backup

To trigger an immediate backup:

```bash
docker compose exec db-backup /backup.sh
```

### Restore from backup

```bash
# Find the backup file
ls backups/postgres/

# Decompress and restore
gunzip -c backups/postgres/last/watch_load_db-*.sql.gz | \
  docker compose exec -T db psql -U postgres watch_load_db
```

---

## Creating the First Admin User

After the stack is running for the first time, the database has no users. You need to insert an admin account directly via SQL.

### 1. Generate a CUID

The `User` model uses CUIDs (not UUIDs) as primary keys, and Postgres has no built-in CUID generator. Run this on your host machine with Node.js:

```bash
node -e "const { createId } = require('@paralleldrive/cuid2'); console.log(createId());"
```

If the package is not installed globally, use `npx`:

```bash
npx --yes @paralleldrive/cuid2
```

Or with Python (install once with `pip install cuid2`):

```bash
python3 -c "from cuid2 import cuid; print(cuid())"
```

Copy the result — it will look something like `cm4b2ttd0000gnr61tkc1djd`.

### 2. Hash the password

Passwords are stored as bcrypt hashes (cost factor 12). Generate one on your host machine with Node.js:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 12).then(h => console.log(h));"
```

Or with Python if you prefer:

```bash
python3 -c "import bcrypt; print(bcrypt.hashpw(b'your-password', bcrypt.gensalt(12)).decode())"
```

Copy the resulting hash (starts with `$2a$12$...`).

### 3. Open a Postgres shell

```bash
docker compose exec db psql -U postgres watch_load_db
```

### 4. Insert the admin user

Replace `<cuid>` and `<hash>` with the values from steps 1 and 2:

```sql
INSERT INTO "users" (id, username, password, role, name, updated_at)
VALUES ('<cuid>',
        'admin',
        '$2a$12$<your-hash-here>',
        'ADMIN',
        'Administrator',
        NOW());
```

Verify the insert:

```sql
SELECT id, username, role, name FROM "users";
```

Then exit the shell:

```sql
\q
```

### 5. Log in

Navigate to `https://your-domain.com` and sign in with the username and password you chose. You can create additional users and workspaces through the admin interface afterwards.

### Changing a password later

If you need to reset a password, generate a new hash (step 1) and update the row:

```sql
UPDATE "users"
SET password = '$2a$12$<new-hash>'
WHERE username = 'admin';
```

---

## Common Operations

### View logs

```bash
# All services
docker compose logs -f

# Single service
docker compose logs -f watch-load
docker compose logs -f caddy
docker compose logs -f db
```

### Restart a single service

```bash
docker compose restart watch-load
```

### Deploy an update

```bash
git pull
docker compose up -d --build watch-load
```

This rebuilds only the `watch-load` image, runs `prisma migrate deploy` on startup, and replaces the running container. Caddy and Postgres keep running uninterrupted.

### Run a Prisma command manually

```bash
docker compose exec watch-load npx prisma migrate status
```

### Open a Postgres shell

```bash
docker compose exec db psql -U postgres watch_load_db
```

### Stop the stack

```bash
# Stop without removing containers or volumes
docker compose stop

# Stop and remove containers (volumes are preserved)
docker compose down

# Stop and remove containers AND all data volumes (destructive!)
docker compose down -v
```

---

## Cross-Platform Builds

If your development machine uses a different CPU architecture than your production server (e.g., Apple Silicon → amd64 Linux), build with `--platform`:

```bash
docker build --platform=linux/amd64 -t watch-load:latest .
```

Or push to a registry and pull on the server:

```bash
docker build --platform=linux/amd64 -t registry.example.com/watch-load:latest .
docker push registry.example.com/watch-load:latest

# On the server — update compose.yaml to use the image instead of build:
# image: registry.example.com/watch-load:latest
docker compose up -d
```

---

## Security Notes

- The database and app ports are never exposed to the host — only Caddy's 80/443 are public.
- The database password is passed via Docker secrets (a file mounted at `/run/secrets/db-password`), not as a plain environment variable.
- The app runs as the unprivileged `node` user inside the container.
- TLS certificates are managed automatically by Caddy via Let's Encrypt.
- Withings OAuth tokens are stored AES-256 encrypted in the database.
- Keep `.env` and `db-password.txt` out of version control (they are in `.gitignore`).

---

## Troubleshooting

### The app fails to start with a migration error

Check that the database is healthy before the app container starts:

```bash
docker compose ps db
docker compose logs db
```

The `depends_on: condition: service_healthy` in `compose.yaml` should handle this automatically, but if the DB takes longer to initialize than the healthcheck window allows, restart the app:

```bash
docker compose restart watch-load
```

### Caddy cannot obtain a TLS certificate

- Confirm port 80 is reachable from the internet (Let's Encrypt uses HTTP-01 challenge).
- Check that `APP_HOSTNAME` in `.env` matches the DNS A record for your server.
- Inspect Caddy logs: `docker compose logs -f caddy`

### Environment validation fails at startup

The app validates all required env vars on startup via `@t3-oss/env-nextjs`. If a required variable is missing you will see an error like:

```
❌ Invalid environment variables: { ENCRYPTION_KEY: [ 'Required' ] }
```

Check `.env` and ensure every required variable is set and non-empty.

### Generating secrets

```bash
# AUTH_SECRET and JWT_SECRET
openssl rand -base64 32

# ENCRYPTION_KEY (must be exactly 64 hex chars = 32 bytes)
openssl rand -hex 32

# Database password
openssl rand -base64 32
```
