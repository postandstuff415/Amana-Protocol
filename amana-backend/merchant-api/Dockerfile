FROM node:20-alpine AS builder

WORKDIR /build
COPY merchant-api/package.json merchant-api/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY merchant-api/tsconfig.json ./
COPY merchant-api/src ./src
COPY shared/types.ts ./src/shared-types.ts
RUN npx tsc

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -S amana && adduser -S amana -G amana

COPY --from=builder /build/dist ./dist
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/package.json ./

USER amana
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

CMD ["node", "dist/index.js"]