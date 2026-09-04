# coblocks-back 리팩토링 계획

> NestJS 백엔드 서버. Socket.io WebSocket Gateway + REST API 담당.

---

## 현재 구조 분석

```
src/
  app.module.ts
  main.ts
  auth/           JWT 검증 (Supabase JWT Secret 기반)
  chat/           채팅 WebSocket Gateway
  classroom/      방 생성/참여/퇴장 WebSocket Gateway + Service
  activity/       활동 관련 모듈
  database/       Supabase 클라이언트 래퍼
  utils/          이벤트 상수 등
  types/          소켓 타입 등
```

### 현재 문제점

| 문제                | 설명                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **인메모리 상태**   | `roomData`, `roomCodeMap`, `userRoomMap` 모두 `Map`으로 인메모리 관리. 서버 재시작 시 모든 방 소멸. 수평 확장 불가 |
| **Supabase 강결합** | JWT 검증이 `SUPABASE_JWT_SECRET`에 의존. Supabase Auth를 쓰지 않으면 JWT 구조가 바뀜                               |
| **DB 접근 방식**    | `supabase.rpc()` 로 stored procedure 호출. 타입 안전성 없음, 테스트 어려움                                         |
| **CORS 미설정**     | `main.ts`에 CORS 설정 없음                                                                                         |
| **단일 환경 설정**  | `.env.development` 하드코딩. 프로덕션 환경 대응 없음                                                               |

---

## 목표 구조

```
src/
  app.module.ts
  main.ts               (CORS, ValidationPipe, Helmet 등 추가)
  auth/                 Better Auth 기반 (자체 JWT 발급)
  chat/                 (유지)
  classroom/            (Gateway 유지, Service의 Map → Redis 전환)
  activity/             (유지)
  problem/              NEW: 문제 CRUD API
  database/
    drizzle.service.ts  NEW: Drizzle ORM 클라이언트
    schema/             NEW: DB 스키마 정의
    redis.service.ts    NEW: Redis 클라이언트
  utils/
  types/
```

---

## 1. Auth 교체: Supabase JWT → Better Auth

### 현재

- 프론트엔드가 Supabase Auth로 로그인 → Supabase JWT 발급
- NestJS가 `SUPABASE_JWT_SECRET`으로 해당 JWT 검증
- JWT payload 구조가 Supabase 전용: `payload.user_metadata.nickname`

### 목표

- NestJS에 Better Auth 세팅 → 자체적으로 유저 발급/JWT 서명
- 프론트엔드는 Better Auth 클라이언트(`@better-auth/client`)로 로그인
- JWT payload 구조를 직접 설계

### 마이그레이션 포인트

```typescript
// 현재 (jwt.strategy.ts)
validate(payload: JwtPayload) {
  return {
    userId: payload.sub,
    userName: payload.user_metadata?.nickname, // Supabase 전용
  };
}

// 목표 (Better Auth 기반)
validate(payload: JwtPayload) {
  return {
    userId: payload.sub,
    userName: payload.name, // 직접 설계한 클레임
  };
}
```

### 참고

- Better Auth 공식: https://www.better-auth.com
- NestJS 통합: `@better-auth/nestjs` 어댑터 사용

---

## 2. DB 접근 방식 교체: Supabase SDK → Drizzle ORM

### 현재

```typescript
// supabase.service.ts — Supabase JS SDK 사용
this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// classroom.service.ts — RPC 호출
await this.supabase.rpc('handle_delete_classroom', {
  target_classroom_id: classroomId,
});
```

### 목표

```typescript
// drizzle.service.ts — 직접 Postgres 연결
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });

// classroom.service.ts — Drizzle 쿼리
await db.delete(classrooms).where(eq(classrooms.id, classroomId));
```

### Supabase Postgres 연결 방법

```
Supabase Dashboard → Project Settings → Database
→ Connection string (URI) 복사
→ Pooler (Transaction mode) 사용 권장 (NestJS 환경에서)
```

### Row Level Security 주의

- Supabase Auth 없이 Drizzle로 직접 쿼리하면 RLS bypass됨
- 보안 로직은 NestJS 서비스 레이어에서 직접 처리해야 함
- RLS 정책은 비활성화하거나, service role key 사용 시 RLS 무시됨 (현재와 동일)

---

## 3. Redis 도입: 인메모리 Map → Redis

### 현재 (classroom.service.ts)

```typescript
private roomData = new Map<string, Classroom>();
private roomCodeMap = new Map<string, string>();
private userRoomMap = new Map<string, string>();
private roomRecoveryTimers = new Map<string, NodeJS.Timeout>();
```

**문제**: 서버 재시작 시 방 데이터 소멸, 다중 인스턴스 불가

### 목표

```typescript
// Redis Hash로 방 데이터 관리
await redis.hset(`room:${roomId}`, roomData);
await redis.set(`roomcode:${code}`, roomId);
await redis.set(`user:${socketId}`, roomId);

// TTL 기반 grace period (setTimeout 대신)
await redis.expire(`room:${roomId}`, 60); // 60초 후 자동 만료
```

### 주의사항

- `roomRecoveryTimers`의 `setTimeout` → Redis TTL + Keyspace Notification으로 대체
- Socket.io 다중 인스턴스 시 `socket.io-redis` 어댑터 필요

---

## 4. 배포: Fly.io + Docker

### Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
RUN corepack enable && yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main"]
```

### fly.toml 핵심 설정

```toml
[build]
  dockerfile = "Dockerfile"

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  # WebSocket을 위한 설정
  [services.concurrency]
    type = "connections"
    hard_limit = 500
    soft_limit = 400
```

### Redis 연결

- **방법 A**: `fly redis create` → Upstash Redis (관리형, 쉬움)
- **방법 B**: Redis 앱 별도 배포 → Fly.io 내부 네트워크(`fly-local-6pn`)로 연결 (레이턴시 최소)

---

## 5. main.ts 보강

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  });

  // Helmet (보안 헤더)
  app.use(helmet());

  await app.listen(process.env.PORT ?? 3000);
}
```

---

## 환경변수 정리 (목표)

```env
# Database
DATABASE_URL=postgresql://...  # Supabase Postgres 직접 연결

# Redis
REDIS_URL=redis://...

# Auth (Better Auth)
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://api.coblocks.dev

# App
PORT=3000
CLIENT_URL=https://coblocks.dev
NODE_ENV=production
```

제거 예정:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
