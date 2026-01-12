FROM oven/bun:1-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS builder
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM base AS production
# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 app

COPY --from=builder --chown=app:nodejs /app/dist ./dist
COPY --from=builder --chown=app:nodejs /app/api-server.ts .
COPY --from=builder --chown=app:nodejs /app/server.ts .
COPY --from=builder --chown=app:nodejs /app/package.json .
COPY --from=builder --chown=app:nodejs /app/node_modules ./node_modules

USER app
EXPOSE 3000
CMD ["bun", "run", "server.ts"]
