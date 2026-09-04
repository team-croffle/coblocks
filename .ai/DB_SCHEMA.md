# Coblocks DB 스키마 설계

> Drizzle ORM + PostgreSQL (Supabase Postgres 직접 연결)
> Redis 도입을 고려한 역할 분리 설계

---

## 역할 분리 원칙

| 저장소 | 담당 데이터 |
|---|---|
| **PostgreSQL (Drizzle)** | 영속 데이터: 유저, 퀘스트, 챕터, 공지, 학습 기록 |
| **Redis** | 휘발성 상태: 현재 활성 방, 소켓↔방 매핑, 유예기간 TTL, 활동 상태 |

---

## 테이블 목록

### 1. `users` — 사용자

```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  nickname    TEXT NOT NULL,
  password_hash TEXT,
  role        TEXT NOT NULL DEFAULT 'student', -- 'student' | 'teacher' | 'admin'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Drizzle 파일**: `src/database/schema/users.schema.ts`

---

### 2. `chapter` — 챕터 (단원)

```sql
CREATE TABLE chapter (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Drizzle 파일**: `src/database/schema/chapter.schema.ts`

---

### 3. `quest` — 퀘스트 (문제 세트 메타)

```sql
CREATE TABLE quest (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id   UUID NOT NULL REFERENCES chapter(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  difficulty   INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  type         TEXT NOT NULL DEFAULT 'equal',  -- 'equal' | 'individual'
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Drizzle 파일**: `src/database/schema/quest.schema.ts`

> `type`: `equal` = 모든 플레이어 동일 블록 / `individual` = 플레이어별 다른 블록

---

### 4. `quest_detail` — 퀘스트 세부 내용 (Blockly 데이터)

```sql
CREATE TABLE quest_detail (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id      UUID NOT NULL UNIQUE REFERENCES quest(id) ON DELETE CASCADE,
  question      JSONB NOT NULL,
  context       JSONB NOT NULL,
  hint          TEXT,
  answer        TEXT,
  default_stage JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Drizzle 파일**: `src/database/schema/quest-detail.schema.ts`

> `question`: equal이면 string, individual이면 `{ player1, player2, ... }`
> `context`: `{ is_equal, player1?, player2?, player3?, player4? }` — 각 player는 `{ blocks[] }`
> `quest`와 1:1 관계.

---

### 5. `quest_sequence` — 퀘스트 시퀀스 (정답 절차 단계)

```sql
CREATE TABLE quest_sequence (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id        UUID NOT NULL REFERENCES quest(id) ON DELETE CASCADE,
  part_number     INTEGER NOT NULL CHECK (part_number BETWEEN 1 AND 4),
  step_number     INTEGER NOT NULL,
  content         JSONB NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (quest_id, part_number, step_number)
);
```

**Drizzle 파일**: `src/database/schema/quest-sequence.schema.ts`

---

### 6. `classroom` — 강의실 (세션 메타)

```sql
CREATE TABLE classroom (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  code        TEXT NOT NULL UNIQUE,
  manager_id  UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at    TIMESTAMPTZ
);
```

**Drizzle 파일**: `src/database/schema/classroom.schema.ts`

> 실시간 상태(participants, state, grace_period)는 **Redis**에서 관리.
> DB에는 세션 시작/종료 이력만 기록. `store_quest.classroom_id` FK 때문에 유지.

---

### 7. `notice` — 공지사항

```sql
CREATE TABLE notice (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  author_id  UUID NOT NULL REFERENCES users(id),
  is_pinned  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Drizzle 파일**: `src/database/schema/notice.schema.ts`

---

### 8. `store_quest` — 풀이 기록 (학습 히스토리)

```sql
CREATE TABLE store_quest (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id),
  quest_id           UUID NOT NULL REFERENCES quest(id),
  classroom_id       UUID REFERENCES classroom(id),
  part_number        INTEGER CHECK (part_number BETWEEN 1 AND 4),
  solve_status       INTEGER NOT NULL DEFAULT 0,
  submission_content JSONB,
  submitted_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Drizzle 파일**: `src/database/schema/store-quest.schema.ts`

> `solve_status`: 0=미완료, 1=완료, 2=정답, 3=오답
> 활동 종료 시 Redis 제출물을 이 테이블에 flush.

---

## Redis 키 설계 (추후 redis.service.ts 구현 시 사용)

| 키 패턴 | 타입 | 내용 | TTL |
|---|---|---|---|
| `room:{classroomId}` | Hash | 방 메타 (name, code, managerId, state) | 없음 |
| `room:{classroomId}:participants` | Hash | socketId → JSON(userId, userName, isManager) | 없음 |
| `roomcode:{code}` | String | classroomId | 없음 |
| `socket:{socketId}` | String | classroomId | 없음 |
| `room:grace:{classroomId}` | String | managerId | 60s (만료 = 방 삭제 트리거) |
| `activity:{classroomId}` | Hash | status, currentQuestId, partAssignments | 없음 |
| `activity:{classroomId}:submissions` | Hash | userId → submissionContent | 없음 |

> Redis Keyspace Notification: `room:grace:{classroomId}` 만료 이벤트 구독으로 방 종료 처리.
> `NOTIFY_KEYSPACE_EVENTS=Ex` 설정 필요.

---

## 테이블 관계도

```
chapter (1) ──── (N) quest (1) ──── (1) quest_detail
                        │
                        └──── (N) quest_sequence
                        │
                        └──── (N) store_quest ──── (N) users
                                       │
                                   classroom ──── users (manager)
```

---

## Drizzle 파일 구조

```
src/database/
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
  drizzle.module.ts
  drizzle.service.ts
```

---

## drizzle.config.ts (루트)

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```
