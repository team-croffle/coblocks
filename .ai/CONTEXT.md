# coblocks-back 작업 컨텍스트

> 다른 PC에서 이어받을 때 필요한 현재 상태 요약.
> 최종 업데이트: 2026-07-12

---

## 프로젝트 개요

- **스택**: NestJS (v11), TypeScript, Socket.io
- **패키지 매니저**: Yarn Berry (v4.17.1)
- **DB**: Drizzle ORM + PostgreSQL 직접 연결 (`drizzle-orm`, `postgres`)
- **인증**: 현재 Supabase JWT (`SUPABASE_JWT_SECRET`) — **추후 Better Auth로 교체 예정**
- **Redis**: 미도입 (설계 완료) — `classroom.service.ts` 인메모리 Map 교체 예정

---

## 완료된 작업 (2026-07-12)

- [x] 스키마 설계 (→ `DB_SCHEMA.md`)
- [x] `@supabase/supabase-js` 제거
- [x] `drizzle-orm`, `postgres`, `drizzle-kit` 추가 (yarn install 완료)
- [x] `supabase.service.ts`, `supabase.module.ts` 삭제
- [x] `app.module.ts`, `classroom.module.ts`, `activity.module.ts`에서 SupabaseModule 제거
- [x] `classroom.service.ts`: `deleteRoomFromDBAsync` → TODO stub
- [x] `activity.service.ts`: `get_quest_for_solving` RPC → TODO stub
- [x] `types/quest.types.ts`: `SupabaseRpcResponse` 제거
- [x] `drizzle.service.ts`, `drizzle.module.ts` 작성 (`@Global()` 모듈)
- [x] `drizzle.config.ts` 루트 추가
- [x] `src/database/schema/` 8개 스키마 파일 작성 + `index.ts`

---

## 남은 작업

### 1. Better Auth 교체 (`REFACTOR.md` 1번 참고)
- `src/auth/jwt.strategy.ts`의 `SUPABASE_JWT_SECRET` → `BETTER_AUTH_SECRET`
- payload 구조: `payload.user_metadata.nickname` → `payload.name`
- `@better-auth/nestjs` 어댑터 설치

### 2. Redis 도입 (`REFACTOR.md` 3번 / `DB_SCHEMA.md` Redis 섹션 참고)
- `src/database/redis.service.ts` 작성
- `classroom.service.ts`의 인메모리 Map → Redis Hash 전환
- `roomRecoveryTimers` setTimeout → Redis TTL + Keyspace Notification

### 3. Drizzle 실제 쿼리 구현 (stub 교체)
- `classroom.service.ts`: `deleteRoomFromDBAsync`
  → `db.update(classroom).set({ endedAt: new Date() }).where(eq(classroom.id, classroomId))`
- `activity.service.ts`: `selectProblemSet`
  → `db.query.quest.findFirst({ with: { questDetail: true }, where: eq(quest.id, questId) })`

---

## 환경변수 현황

### 현재 `.env.development`
```
SUPABASE_URL=...              ← 제거 예정
SUPABASE_SERVICE_ROLE_KEY=... ← 제거 예정
SUPABASE_JWT_SECRET=...       ← Better Auth 교체 후 제거
```

### 목표
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=...
PORT=3000
CLIENT_URL=...
NODE_ENV=development
```

---

## Supabase 잔존 코드 (아직 교체 안 된 것)

| 파일 | 내용 | 처리 시점 |
|---|---|---|
| `src/auth/jwt.strategy.ts` | `SUPABASE_JWT_SECRET`, `user_metadata.nickname` | Better Auth 교체 시 |
| `src/classroom/classroom.service.ts` | `deleteRoomFromDBAsync` TODO stub | Drizzle 쿼리 구현 시 |
| `src/activity/activity.service.ts` | `selectProblemSet` TODO stub | Drizzle 쿼리 구현 시 |

---

## 현재 파일 구조

```
src/
  app.module.ts           ConfigModule, EventEmitterModule, DrizzleModule, ClassroomModule, ChatModule, ActivityModule, AuthModule
  auth/
    jwt.strategy.ts       ← SUPABASE_JWT_SECRET 아직 사용 중
    jwt-auth.guard.ts
    auth.module.ts
    manager/manager.guard.ts
  chat/chat.gateway.ts, chat.module.ts
  classroom/
    classroom.gateway.ts
    classroom.service.ts  ← deleteRoomFromDBAsync: TODO stub
    classroom.module.ts
  activity/
    activity.gateway.ts
    activity.service.ts   ← selectProblemSet: TODO stub
    activity-state.service.ts
    activity.module.ts
  database/
    drizzle.service.ts    ← PostgresJS 연결, DrizzleService
    drizzle.module.ts     ← @Global() 모듈
    schema/
      index.ts
      users.schema.ts
      chapter.schema.ts
      quest.schema.ts
      quest-detail.schema.ts
      quest-sequence.schema.ts
      classroom.schema.ts
      notice.schema.ts
      store-quest.schema.ts
  types/
    quest.types.ts        ← QuestEntity 인터페이스 (SupabaseRpcResponse 제거됨)
    socket.types.ts
  utils/events.ts
  websocket-exception/websocket-exception.filter.ts
drizzle.config.ts         ← drizzle-kit 설정
```
