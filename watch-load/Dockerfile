# syntax=docker/dockerfile:1

ARG NODE_VERSION=24
ARG BUN_VERSION=1.3

FROM oven/bun:$BUN_VERSION AS base
WORKDIR /app

FROM base AS builder
COPY package.json bun.lock ./
COPY prisma ./prisma

RUN bun install --frozen-lockfile

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=1

RUN bun run build

FROM node:$NODE_VERSION AS runner
LABEL org.opencontainers.image.source=https://github.com/cobralion/watch-load
WORKDIR /app

ARG PRISMA_VERSION=7.4.2

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/public ./public

RUN mkdir .next && chown node:node .next

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/prisma.config.production.ts ./prisma.config.ts
COPY --from=builder --chown=node:node /app/package.json ./package.json

RUN npm install prisma@$PRISMA_VERSION \
 && chown -R node:node node_modules

USER node

EXPOSE 3000

CMD ["npm", "run", "start:deploy"]