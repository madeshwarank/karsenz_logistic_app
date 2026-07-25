FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN pnpm install --filter @karsenz/api... --frozen-lockfile=false
RUN pnpm --filter @karsenz/api prisma generate
RUN pnpm --filter @karsenz/api build
EXPOSE 4000
CMD ["sh", "-c", "pnpm --filter @karsenz/api prisma migrate deploy && pnpm --filter @karsenz/api db:seed && pnpm --filter @karsenz/api start"]
