FROM node:24-alpine AS base

RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000
# ENTRYPOINT ["npm", "run"]
# CMD ["dev"]
