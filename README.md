# watch-load

A multi-tenant web platform for collecting, managing, and analyzing ECG and heart-rate measurements from [Withings](https://www.withings.com/) health devices. Built for research and clinical workflows where multiple independent workspaces each operate their own device and track measurements per participant or trial.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Commands](#available-commands)
- [Application Pages](#application-pages)
- [Withings Device Integration](#withings-device-integration)
- [Data Export](#data-export)
- [Deployment](#deployment)
- [Database](#database)
- [Development Notes](#development-notes)

---

## Overview

watch-load lets research teams connect a Withings smartwatch to a workspace, sync ECG recordings, annotate measurements with trial IDs and location tags, and export the data as CSV for downstream analysis.

**Key features:**

- Connect Withings devices via OAuth 2.0 and sync ECG/heart-rate measurements on demand
- AFib detection classification per measurement (negative / positive / inconclusive / unknown)
- Multi-workspace architecture — each workspace has its own device connection, members, and data
- Dual-axis role-based access control: global roles (`ADMIN` / `USER`) and workspace roles (`WORKSPACE_ADMIN` / `WORKSPACE_USER`)
- Annotate measurements with custom trial IDs and workspace-defined location labels
- Export measurement data (including raw ECG signal arrays) as CSV
- Global admin panel for user provisioning and management
- Secure OAuth token storage using AES-256 encryption

---

## Tech Stack

| Layer              | Technology                                |
| ------------------ | ----------------------------------------- |
| Framework          | Next.js 16 (App Router)                   |
| Runtime            | Node.js 24.11.0 / Bun                     |
| Language           | TypeScript 5                              |
| UI                 | React 19, shadcn/ui, Tailwind CSS v4      |
| Auth               | NextAuth v5 (beta) — credentials provider |
| Authorization      | CASL                                      |
| Server Actions     | next-safe-action                          |
| Validation         | Zod 4                                     |
| ORM                | Prisma 7 with `@prisma/adapter-pg`        |
| Database           | PostgreSQL 16                             |
| Forms              | React Hook Form                           |
| Tables             | TanStack Table v8                         |
| State              | Zustand                                   |
| Notifications      | Sonner                                    |
| Icons              | Lucide React                              |
| Package Manager    | Bun                                       |
| Linting/Formatting | ESLint 9, Prettier 3                      |

---

## Architecture

### Authentication

Handled by NextAuth v5 (`lib/auth.ts`) with a credentials provider (username + password). Passwords are hashed with bcrypt. Sessions are JWT-based; the token embeds `id`, `role`, and `username`. A `resetToken` field on the user record forces a password-reset flow before login is allowed.

### Authorization

Two independent role axes are in use:

| Axis                        | Values                              |
| --------------------------- | ----------------------------------- |
| Global (`GlobalRole`)       | `ADMIN`, `USER`                     |
| Workspace (`WorkspaceRole`) | `WORKSPACE_ADMIN`, `WORKSPACE_USER` |

`lib/workspace.ts` exposes `resolveWorkspaceFromSlug` / `resolveWorkspaceFromId` (React-cached server helpers). These return a `ResolvedWorkspace` that normalizes workspace role to `'ADMIN' | 'USER'` — global admins always receive `'ADMIN'` regardless of their membership row. All server actions use these helpers to enforce access control. Client-side permission checks use CASL.

### Server Actions

`lib/safe-action.ts` exports two `next-safe-action` clients:

- `publicActionClient` — unauthenticated
- `actionClient` — authenticated; accepts optional `requiredRole` metadata (`USER` | `ADMIN`). Passes `{ userId, name, username, userRole }` as `ctx` to the handler.

Actions live in `actions/` and are always `'use server'` files. Zod schemas for inputs live in `lib/validations/`.

### Withings Integration

`lib/withings/` implements the full OAuth 2.0 device connection flow:

1. **`oauth.ts`** — state JWT creation/verification (5-min expiry), authorization URL builder, token exchange, device disconnect/revoke.
2. **`signing.ts`** — HMAC request signing required by the Withings API.
3. **`token-management.ts`** — access-token refresh logic.
4. **`heart.ts`** — paginates and fetches ECG/heart measurements from the Withings API; handles batching and rate limits.

OAuth tokens are stored AES-256 encrypted in the database (`lib/encryption.ts`).

### Data Models

| Model                | Purpose                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `User`               | Application user — username, hashed password, global role, password-reset token          |
| `Workspace`          | Isolated tenant — name, slug, description                                                |
| `Membership`         | Join table linking users to workspaces with a workspace-level role                       |
| `WithingsConnection` | Encrypted OAuth tokens for a workspace's connected Withings device                       |
| `HeartMeasurement`   | Individual ECG recording — heart rate, AFib status, raw signal array, sampling frequency |
| `LocationOption`     | Workspace-defined location labels that can be assigned to measurements                   |

---

## Project Structure

```
watch-load/                  # repo root
├── db/
│   └── docker-compose.yaml  # local PostgreSQL 16 container
├── CLAUDE.md                # development guidance
└── watch-load/              # Next.js application
    ├── app/
    │   ├── (dashboard)/     # protected route group
    │   │   ├── layout.tsx   # sidebar + header shell
    │   │   ├── dashboard/   # /dashboard
    │   │   ├── admin/       # /admin (global admins only)
    │   │   ├── profile/     # /profile
    │   │   └── workspace/
    │   │       └── [workspaceSlug]/
    │   │           ├── page.tsx             # ECG data table
    │   │           ├── connected-devices/   # device management
    │   │           └── settings/            # workspace settings
    │   ├── login/           # /login
    │   ├── reset-password/  # /reset-password
    │   └── api/
    │       ├── auth/[...nextauth]/  # NextAuth handler
    │       ├── withings/
    │       │   ├── connect/         # initiates OAuth flow
    │       │   └── callback/        # OAuth callback
    │       └── ecg/download/        # CSV export
    ├── actions/             # server actions (admin, auth, heart, workspace)
    ├── components/
    │   ├── ui/              # shadcn/ui primitives
    │   ├── workspace/       # ECG table, location select, trials dialog
    │   ├── workspace-settings/
    │   ├── admin/
    │   └── profile/
    ├── lib/
    │   ├── auth.ts          # NextAuth config
    │   ├── safe-action.ts   # action clients
    │   ├── workspace.ts     # workspace resolution helpers
    │   ├── encryption.ts    # AES-256 helpers
    │   └── withings/        # OAuth, signing, token mgmt, heart sync
    ├── prisma/
    │   └── schema.prisma    # database schema
    ├── env/
    │   ├── server.ts        # server-side env validation (Zod)
    │   └── client.ts        # client-side env validation
    ├── generated/prisma/    # Prisma client output
    ├── Dockerfile
    ├── compose.yaml
    └── Caddyfile
```

---

## Getting Started

### Prerequisites

- **Node.js** 24.11.0
- **Bun** — `npm install -g bun`
- **Docker** (for the local PostgreSQL database)
- A [Withings developer account](https://developer.withings.com/) with an OAuth application registered

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd watch-load/watch-load
bun install
```

### 2. Start the local database

```bash
# from the repo root
docker compose -f db/docker-compose.yaml up -d
```

This starts a PostgreSQL 16 container on port `5432` with database `watch_load_db`.

### 3. Configure environment variables

Copy and fill in the environment file:

```bash
cp .env.example .env   # or create watch-load/.env manually
```

See the [Environment Variables](#environment-variables) section for a full description of every variable.

### 4. Run migrations and generate the Prisma client

```bash
bunx prisma migrate dev
bunx prisma generate
```

The generated client is placed in `generated/prisma/`.

### 5. Start the development server

```bash
bun dev
```

The application is available at `http://localhost:3000`.

---

## Environment Variables

All variables live in `watch-load/.env`. They are validated at startup via `@t3-oss/env-nextjs` in `env/server.ts` and `env/client.ts`.

| Variable                 | Required | Description                                                                                         |
| ------------------------ | -------- | --------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`           | Yes      | Full PostgreSQL connection string (e.g. `postgresql://postgres:admin@localhost:5432/watch_load_db`) |
| `AUTH_SECRET`            | Yes      | Random secret used by NextAuth to sign session tokens                                               |
| `ENCRYPTION_KEY`         | Yes      | 64 hex characters (= 32 bytes) used for AES-256 encryption of Withings tokens                       |
| `JWT_APP_ISSUER`         | Yes      | JWT issuer claim — set to `watch-load`                                                              |
| `JWT_APP_AUDIENCE`       | Yes      | JWT audience claim — set to `watch-load`                                                            |
| `JWT_SECRET`             | Yes      | Secret for signing internal state JWTs (Withings OAuth flow)                                        |
| `WITHINGS_CLIENT_ID`     | Yes      | OAuth client ID from the Withings developer portal                                                  |
| `WITHINGS_CLIENT_SECRET` | Yes      | OAuth client secret from the Withings developer portal                                              |
| `WITHINGS_REDIRECT_URI`  | Yes      | OAuth callback URL — `http://localhost:3000/api/withings/callback` in development                   |
| `APP_URL`                | Yes      | Public base URL of the application (no trailing slash) — e.g. `http://localhost:3000`               |
| `NODE_ENV`               | Yes      | `development` or `production`                                                                       |

To generate a valid `ENCRYPTION_KEY`:

```bash
openssl rand -hex 32
```

To generate a valid `AUTH_SECRET`:

```bash
openssl rand -hex 32
```

To generate a valid `JWT_SECRET`:

```bash
openssl rand -hex 32
```

---

## Available Commands

All commands must be run from inside `watch-load/`.

| Command                   | Description                                                           |
| ------------------------- | --------------------------------------------------------------------- |
| `bun dev`                 | Start the Next.js development server                                  |
| `bun build`               | Production build                                                      |
| `bun start`               | Start the production server                                           |
| `bun lint`                | Run ESLint                                                            |
| `bun format`              | Run Prettier (writes changes)                                         |
| `bun format:check`        | Run Prettier (check only, no writes)                                  |
| `bun start:deploy`        | Run pending Prisma migrations, then start the server (used in Docker) |
| `bunx prisma migrate dev` | Apply pending migrations and update the Prisma client                 |
| `bunx prisma generate`    | Regenerate the Prisma client without running migrations               |

---

## Application Pages

| Route                                 | Access                    | Description                                                     |
| ------------------------------------- | ------------------------- | --------------------------------------------------------------- |
| `/login`                              | Public                    | Username/password login                                         |
| `/reset-password`                     | Public (with valid token) | Set a new password after receiving a reset link                 |
| `/dashboard`                          | Authenticated             | Home screen; create new workspaces                              |
| `/admin`                              | Global `ADMIN` only       | Create users, manage global roles                               |
| `/profile`                            | Authenticated             | Change your own password                                        |
| `/workspace/[slug]`                   | Workspace member          | ECG data table for the workspace; sync measurements             |
| `/workspace/[slug]/connected-devices` | Workspace admin           | Connect, view, and disconnect Withings devices                  |
| `/workspace/[slug]/settings`          | Workspace admin           | Edit workspace metadata, manage members, manage location labels |

---

## Withings Device Integration

### Connecting a device

1. Navigate to `/workspace/[slug]/connected-devices` as a workspace admin.
2. Click **Connect Device** — this calls `/api/withings/connect`, which sets a short-lived signed JWT in an HTTP-only cookie and redirects to the Withings authorization page.
3. After the user authorizes on the Withings side, Withings redirects to `/api/withings/callback` with an authorization code and the state parameter.
4. The callback handler verifies the state JWT (CSRF protection), exchanges the code for tokens, encrypts them with AES-256, and stores them in `WithingsConnection`.

### Syncing measurements

From the workspace page, clicking **Sync** triggers `syncHeartAction` (in `actions/heart.ts`), which:

1. Refreshes the access token if expired.
2. Paginates through `heartlist` on the Withings API (100 records per page).
3. Fetches ECG signal data in batches of 10 (to respect rate limits).
4. Upserts new `HeartMeasurement` records (skipping duplicates by `signalId`).
5. Updates `lastSync` on the connection record.

### Disconnecting a device

Disconnecting revokes the Withings OAuth token, removes the `WithingsConnection` record, and (currently) removes all synced measurements for that workspace. This action is restricted to workspace admins.

### Token storage

Withings OAuth tokens (`accessToken`, `refreshToken`) are encrypted with AES-256-GCM before being written to the database and decrypted on read. The key is derived from the `ENCRYPTION_KEY` environment variable.

---

## Data Export

Authenticated workspace members can download all measurements as a CSV file via:

```
GET /api/ecg/download?workspaceSlug=<slug>
```

The export includes: `id`, `signalId`, `deviceId`, `heartRate`, `afib`, `samplingFrequency`, `timestamp`, `modified`, `trialsId`, `location`, and the raw `signal` array.

---

## Deployment

The application ships with a `Dockerfile` and `compose.yaml` inside `watch-load/`. For detailed instructions on building the image, configuring secrets, and running in production with Caddy as a reverse proxy, see:

```
watch-load/README.Docker.md
```

Quick start with Docker Compose:

```bash
cd watch-load
docker compose up -d
```

The `start:deploy` script (`bunx prisma migrate deploy && bun start`) is the container entrypoint — it runs any pending migrations before starting the server.

---

## Database

### Schema overview

The Prisma schema lives at `watch-load/prisma/schema.prisma`. The generated client is output to `watch-load/generated/prisma/` (imported as `@/generated/prisma`).

Key indexes:

- `HeartMeasurement`: compound index on `(workspaceId, deviceId, timestamp DESC)` for efficient workspace-scoped queries sorted by time.
- `WithingsConnection`: indexed on `workspaceId` for fast workspace lookups.

### Common database operations

```bash
# apply new migrations in development
bunx prisma migrate dev

# apply migrations in production (non-interactive)
bunx prisma migrate deploy

# regenerate the Prisma client after schema changes
bunx prisma generate

# open Prisma Studio (local database GUI)
bunx prisma studio
```

---

## Development Notes

### Code quality

Pre-commit hooks are managed by Husky and lint-staged. On every commit:

- ESLint runs on all staged `.ts` / `.tsx` files.
- Prettier runs on all staged `.ts`, `.tsx`, `.md`, and `.json` files.

Run checks manually:

```bash
bun lint
bun format:check
```

### Workspace resolution caching

`lib/workspace.ts` uses React's `cache()` to deduplicate workspace resolution calls within a single request. This means calling `resolveWorkspaceFromSlug` multiple times in the same render tree hits the database only once.

### Password reset flow

When an admin creates a user (via the admin panel), the new user receives a `resetToken` valid for 24 hours. On first login, NextAuth detects the token and redirects the user to `/reset-password` before completing authentication. Direct credential login is blocked until the password is reset.
