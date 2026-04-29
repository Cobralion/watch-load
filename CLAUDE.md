# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

The app lives entirely inside `watch-load/` (the Next.js project). The `db/` directory at the repo root contains only Docker Compose for the local Postgres database.

## Commands

All commands must be run from inside `watch-load/` using **pnpm**.

```bash
pnpm dev          # start dev server
pnpm build        # production build
pnpm lint         # ESLint
pnpm format       # Prettier (write)
pnpm format:check # Prettier (check only)
```

Prisma:
```bash
pnpx prisma migrate dev   # run migrations
pnpx prisma generate      # regenerate client (output: generated/prisma/)
```

Database (from repo root):
```bash
docker compose -f db/docker-compose.yaml up -d   # start Postgres on port 5432
```

Node version: **24.11.0**

## Environment Variables

Copy to `watch-load/.env`:

```
DATABASE_URL=
AUTH_SECRET=
ENCRYPTION_KEY=         # must be 64 hex chars (32-byte AES-256 key)
JWT_APP_ISSUER=watch-load
JWT_APP_AUDIENCE=watch-load
JWT_SECRET=
WITHINGS_CLIENT_ID=
WITHINGS_CLIENT_SECRET=
WITHINGS_REDIRECT_URI=http://localhost:3000/api/withings/callback
APP_URL=http://localhost:3000
NODE_ENV=development
```

Validated at startup via `@t3-oss/env-nextjs` in `env/server.ts` and `env/client.ts`.

## Architecture

### Authentication

`lib/auth.ts` — NextAuth v5 (beta) with a credentials provider. Username/password login only. JWT strategy: `id`, `role`, and `username` are embedded in the token and surfaced on `session.user`. A `resetToken` presence on the user record forces a password-reset flow before login succeeds.

### Server Actions

`lib/safe-action.ts` exports two clients built with `next-safe-action`:

- `publicActionClient` — unauthenticated actions
- `actionClient` — authenticated; accepts optional `requiredRole` metadata (`USER` | `ADMIN`). Passes `{ userId, name, username, userRole }` as `ctx` to the action handler.

Actions live in `actions/` and are always `'use server'` files. Zod schemas for action inputs live in `lib/validations/`.

### Authorization Model

Two independent role axes:

| Axis | Values |
|------|--------|
| Global (`GlobalRole`) | `ADMIN`, `USER` |
| Workspace (`WorkspaceRole`) | `WORKSPACE_ADMIN`, `WORKSPACE_USER` |

`lib/workspace.ts` exposes `resolveWorkspaceFromSlug` / `resolveWorkspaceFromId` (React-cached). These resolve a `ResolvedWorkspace` that normalizes workspace role to `'ADMIN' | 'USER'` — global admins always get `'ADMIN'` regardless of their membership row. Server actions call these helpers to enforce access control.

### Withings Integration

`lib/withings/` handles the full OAuth 2.0 device-connection flow:

1. `oauth.ts` — state JWT creation/verification (5-min expiry), authorization URL builder, token exchange, and device disconnect/revoke.
2. `signing.ts` — HMAC request signing required by the Withings API.
3. `token-management.ts` — access-token refresh.
4. `heart.ts` — fetches ECG/heart measurements from the Withings API.

Tokens are stored AES-256 encrypted in the database (`lib/encryption.ts`). The OAuth callback is at `/api/withings/callback`; the connect redirect is at `/api/withings/connect`.

### Database

Prisma 7 with the `@prisma/adapter-pg` driver. Schema at `prisma/schema.prisma`; generated client at `generated/prisma/`. Key models: `User`, `Workspace`, `Membership`, `WithingsConnection`, `HeartMeasurement`, `LocationOption`.

### Routing

Next.js App Router. All authenticated pages are under `app/(dashboard)/` which applies a shared layout with the sidebar. Workspace pages are nested under `app/(dashboard)/workspace/[workspaceSlug]/` with a `workspace-provider.tsx` context that makes the resolved workspace available to children.

### UI

shadcn/ui components in `components/ui/`. Feature components in `components/workspace/`, `components/workspace-settings/`, `components/admin/`, and `components/profile/`. Tailwind CSS v4.
