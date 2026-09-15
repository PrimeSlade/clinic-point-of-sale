FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk add --no-cache openssl \
    && corepack enable \
    && corepack install --global pnpm@10.29.2

FROM base AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json

RUN pnpm install --frozen-lockfile --filter @pos/api...

COPY apps/api ./apps/api

RUN pnpm --filter @pos/api exec prisma generate \
    && pnpm --filter @pos/api build

FROM base AS runtime

ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

COPY --from=build --chown=node:node /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/apps/api/package.json ./apps/api/package.json
COPY --from=build --chown=node:node /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build --chown=node:node /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=node:node /app/apps/api/prisma ./apps/api/prisma
COPY --from=build --chown=node:node /app/apps/api/src/generated/prisma ./apps/api/src/generated/prisma

USER node

CMD ["sh", "-c", "./apps/api/node_modules/.bin/prisma migrate deploy --schema=apps/api/prisma/schema.prisma && exec node apps/api/dist/index.js"]
