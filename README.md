# Coblocks

2022 개정 교육과정 기준 초·중·고 블록코딩 학습 서비스.
블록으로 시작해 순서도·의사코드를 거쳐 텍스트 코드로 넘어가는 학습 경로를 성취기준에 맞춰 제공한다.

## 스택

| 영역 | 선택 |
| --- | --- |
| 프론트 | React 19.2 + React Compiler 1 · Vite · TypeScript 6.0.3 · TanStack Router/Query · Zustand · Tailwind v4 |
| API | NestJS 10 · Drizzle ORM · PostgreSQL 16 · JWT(Passport) |
| 공통 | `packages/shared` — 타입, 커리큘럼 시드, 블록 인터프리터 |
| 툴링 | oxlint · oxfmt (ESLint/Prettier 미사용) |
| 배포 | 프론트 Netlify, API Render, DB Supabase/자체 Postgres |

## 구조

```
coblocks/
├─ apps/
│  ├─ web/                 React 19 SPA
│  │  └─ src/
│  │     ├─ api/           axios 클라이언트 + 엔드포인트별 래퍼
│  │     ├─ components/    블록 팔레트/워크스페이스/스테이지/확대 패널
│  │     ├─ hooks/         useBlockRunner — 단계별 실행 애니메이션
│  │     ├─ layouts/       AppLayout(학습자), AdminLayout(관리자)
│  │     ├─ pages/         랜딩·로그인·대시보드·커리큘럼·학습 플레이어
│  │     ├─ pages/admin/   개요·문제등록·문제관리·유저·감사·문의
│  │     ├─ router.tsx     TanStack Router 라우트 트리 + 인증/역할 가드
│  │     ├─ stores/        auth, theme (zustand)
│  │     └─ styles/        tokens.css(@theme 토큰), main.css
│  └─ api/                 NestJS
│     └─ src/
│        ├─ db/            Drizzle 스키마 · 클라이언트 · 시드
│        ├─ common/        마스킹 유틸, 감사 서비스, 역할 가드
│        ├─ auth/          로그인 · JWT 전략
│        ├─ lessons/       미션 조회
│        ├─ progress/      학습 진도 · 서버 채점
│        └─ admin/         관리자 전용 엔드포인트
├─ packages/shared/        타입 + 커리큘럼 데이터 + 인터프리터
└─ docs/                   설계 문서
```

## 시작하기

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

pnpm db:up        # docker compose 로 Postgres 기동
pnpm db:push      # Drizzle 스키마 반영
pnpm db:seed      # 성취기준 · 미션 · 개발 계정 시드

pnpm dev          # web(:5173) + api(:3000) 동시 실행
pnpm check        # oxlint + oxfmt --check + 타입 체크
```

개발 계정(비밀번호 = 아이디): `student1`, `teacher1`, `admin`.
`admin` 으로 로그인하면 대시보드에 관리자 진입 버튼과 상단 탭이 나타난다.

## 설계상 지켜야 할 것

- **채점은 서버가 한다.** 클라이언트의 실행 결과는 미리보기이고, 완료 처리는 `progress.attempt` 가 `@coblocks/shared` 의 `run()` 으로 다시 계산한 결과로만 정해진다.
- **개인정보는 마스킹된 형태로만 나간다.** 사용자 데이터를 응답에 담는 모든 경로는 `common/masking.ts` 를 거친다. 원본 열람은 `unmask_requests` 에 사유를 남기고 승인을 받아야 한다.
- **감사 로그는 추가만 한다.** `audit_logs` 는 수정·삭제하지 않는다. DB 사용자 권한으로도 UPDATE/DELETE 를 막을 것.
- **개념 색은 고정이다.** 개념 8종의 색은 `tokens.css` 의 `--color-seq … --color-ai` 이고, 순서를 바꾸거나 순환 재사용하지 않는다.
- **색은 항상 토큰으로 쓴다.** Tailwind v4 는 `@theme` 에 선언한 변수를 그대로 유틸리티로 만든다. 다크 모드는 `prefers-color-scheme` 과 `data-theme` 두 경로로 같은 변수를 덮어쓰는 방식이라, 미디어쿼리 안에서 처음 정의된 색은 시스템 기본 상태에서 적용되지 않는다.
- **수동 메모이제이션을 넣지 않는다.** React Compiler 가 켜져 있으므로 `useMemo`/`useCallback`/`memo` 는 계측으로 필요성이 확인된 곳에만 쓴다.

## 문서

- [docs/01-architecture.md](docs/01-architecture.md) — 구성과 데이터 흐름
- [docs/02-data-model.md](docs/02-data-model.md) — 테이블과 관계
- [docs/03-api.md](docs/03-api.md) — 엔드포인트 명세
- [docs/04-curriculum.md](docs/04-curriculum.md) — 교육과정 매핑 규칙
- [docs/05-roadmap.md](docs/05-roadmap.md) — 남은 작업

## 출처

성취기준 원문은 2022 개정 교육과정 실과(기술·가정)/정보과 고시를 따른다.
미션 구성과 차시는 성취기준을 근거로 만든 예시안이며 교과서 단원과 1:1 대응하지 않는다.
