# 아키텍처

## 왜 이 구성인가

- **React SPA + NestJS 분리**: 관리자 콘솔이 감사 로그·개인정보 마스킹·권한 승인처럼 서버 로직이 무거운 영역을 갖는다. 프론트와 API를 한 프레임워크에 묶으면(SSR 통합) 이 경계가 흐려져서, 처음부터 분리했다.
- **`packages/shared`**: 블록 인터프리터를 web과 api가 **같은 코드**로 돌려야 한다. 채점 규칙이 두 벌이 되면 "내 화면에선 성공했는데 완료가 안 돼요" 문의가 그대로 발생한다.
- **Drizzle**: 스키마가 곧 타입이라 shared 타입과의 왕복이 짧다. 마이그레이션 SQL도 눈으로 검토할 수 있다.

## 데이터 흐름 — 미션 실행

```
학생이 블록을 쌓고 [실행하기]
      │
      ├─ web: useBlockRunner → shared.compile / applyStep
      │      한 단계씩 애니메이션 (미리보기)
      │
      └─ web: POST /api/progress/:lessonId/attempt { program }
             │
             api: ProgressService.attempt
               ├─ lessons 에서 stage 조회
               ├─ shared.run(stage, program)     ← 판정은 여기서만
               ├─ progress upsert (attempts +1, 성공 시 completed)
               └─ AuditService.record(category: 'activity')
```

클라이언트는 결과를 그리기만 하고, 완료 여부는 서버 응답을 신뢰한다.

## 인증

- 로그인 → argon2 검증 → JWT(기본 8시간) 발급, `localStorage` 저장.
- 매 요청 `Authorization: Bearer`. 401이면 프론트가 로그인으로 되돌리며 `redirect` 쿼리에 원래 경로를 담는다.
- `JwtStrategy.validate` 는 토큰이 유효해도 계정 상태를 DB에서 다시 확인한다(정지 계정 차단).
- 라우터 가드는 TanStack Router 의 `beforeLoad` 에서 `redirect()` 를 던지는 방식이다. `/app` 은 로그인만, `/admin` 은 로그인 + `role === 'admin'` 을 본다. 서버 가드가 진짜 방어선이고, 라우터 가드는 UX용이다.
- 라우터 컨텍스트에는 사용자 **값**이 아니라 `getUser()` 함수를 넣는다. 가드는 라우트 매칭 시점마다 최신 스토어 상태를 읽어야 하기 때문이다.

## 레이어 경계

| 레이어 | 하는 일 | 하지 않는 일 |
| --- | --- | --- |
| `pages/` | 화면 조립, 사용자 입력 | HTTP 직접 호출 |
| `api/` (web) | axios 래퍼, 타입 부여 | 비즈니스 판단 |
| `controller` | 입력 검증(class-validator), 인증/권한 | 도메인 로직 |
| `service` | 도메인 로직, 트랜잭션, 감사 기록 | HTTP 관심사 |
| `shared` | 순수 함수와 타입 | I/O |

## 배포

- web: `pnpm --filter @coblocks/web build` → `dist/` 정적 호스팅(Netlify). SPA 폴백 필요 — `/*  /index.html  200`.
- React Compiler 는 Babel 파이프라인의 **첫 번째**로 돌아야 한다. `@vitejs/plugin-react` v6 부터 Babel 이 빠졌으므로 `@rolldown/plugin-babel` + `reactCompilerPreset()` 조합을 유지할 것. 최적화 여부는 React DevTools 의 "Memo ✨" 배지로 확인한다.
- api: `pnpm --filter @coblocks/api build` → `node dist/main.js` (Render). `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` 필수.
- DB: Postgres 16. Supabase를 쓸 경우 connection pooler 주소를 `DATABASE_URL` 로 준다.
