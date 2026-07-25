FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/web ./apps/web
RUN pnpm install --filter @karsenz/web... --frozen-lockfile=false
RUN pnpm --filter @karsenz/web build
EXPOSE 3000
CMD ["pnpm", "--filter", "@karsenz/web", "start"]
