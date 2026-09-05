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
# 점 셋(...)이 있어야 의존 워크스페이스인 @coblocks/shared 를 먼저 빌드한다.
# api 는 이제 shared 의 소스가 아니라 packages/shared/dist 를 참조하므로 이게 없으면 실패한다.
RUN pnpm --filter "@coblocks/api..." build

# ── 런타임
FROM base AS runtime
ENV NODE_ENV=production \
    PORT=3000
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
# node_modules 의 @coblocks/shared 는 /app/packages/shared 를 가리키는 심링크다.
# 그 실체(빌드 산출물 + package.json)를 함께 넣어야 런타임에서 해석된다.
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api').then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"
# tsconfig.build.json 이 rootDir 을 src 로 고정하므로 진입점은 항상 dist/main.js 다.
CMD ["node", "apps/api/dist/main.js"]
