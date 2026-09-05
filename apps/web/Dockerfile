# syntax=docker/dockerfile:1
# 빌드 컨텍스트는 저장소 루트다.
#   docker build -f apps/web/Dockerfile .

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    CI=true
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

FROM deps AS build
# API 주소는 빌드 시점에 정적으로 박힌다. 기본값은 같은 오리진의 /api
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY packages/shared packages/shared
COPY apps/web apps/web
# 점 셋(...)이 있어야 의존 워크스페이스인 @coblocks/shared 를 먼저 빌드한다.
# vite 별칭을 걷어내서 web 도 shared 의 소스가 아니라 packages/shared/dist 를 쓴다.
# (정적 산출물만 nginx 로 넘기므로 런타임 스테이지에는 shared 를 넣을 필요가 없다.)
RUN pnpm --filter "@coblocks/web..." build

FROM nginx:1.27-alpine AS runtime
# API_UPSTREAM 을 넣으면 /api 를 그쪽으로 프록시한다(compose 에서 사용).
ENV API_UPSTREAM=http://api:3000
COPY apps/web/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
