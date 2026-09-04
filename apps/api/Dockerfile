# syntax=docker/dockerfile:1
# 빌드 컨텍스트는 저장소 루트다. pnpm 워크스페이스 전체가 필요하기 때문.
#   docker build -f apps/api/Dockerfile .

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    CI=true
RUN corepack enable
WORKDIR /app

# ── 의존성 (워크스페이스 매니페스트만 먼저 복사해 캐시를 살린다)
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

# ── 런타임 의존성만 (argon2 등 네이티브 모듈은 여기서 빌드된다)
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --prod --filter @coblocks/api...

# ── 빌드
FROM deps AS build
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @coblocks/api build
# tsconfig 의 include 가 packages/shared 를 함께 잡으므로 dist 안의 경로가 달라질 수 있다.
# 진입점을 빌드 시점에 찾아 기록해 두고 런타임에서 그대로 쓴다.
RUN ENTRY="$(find apps/api/dist -name main.js | head -n 1)" \
    && test -n "$ENTRY" \
    && echo "$ENTRY" > /app/entrypoint.path \
    && echo "entry: $ENTRY"

# ── 런타임
FROM base AS runtime
ENV NODE_ENV=production \
    PORT=3000
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/entrypoint.path ./entrypoint.path
COPY apps/api/package.json apps/api/package.json
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api').then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"
CMD ["sh", "-c", "node $(cat /app/entrypoint.path)"]
