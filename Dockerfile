# syntax=docker/dockerfile:1.7

FROM node:20-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Prisma generate needs DATABASE_URL at build time; a safe placeholder is fine.
ENV DATABASE_URL="postgresql://postgres:postgres@db:5432/catalog"
RUN pnpm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=build /app/package.json /app/pnpm-lock.yaml ./
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/.next /app/.next
COPY --from=build /app/public /app/public
COPY --from=build /app/next.config.ts /app/next.config.ts
COPY --from=build /app/generated /app/generated
COPY --from=build /app/prisma /app/prisma

EXPOSE 3000
CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm start"]
