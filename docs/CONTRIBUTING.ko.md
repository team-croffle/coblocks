# Coblocks 기여 안내

> 🇺🇸 [Read in English](../CONTRIBUTING.md)

시간 내 주어 고맙다. 이 프로젝트는 학교 현장에서 쓰이는 것을 전제로 하므로, 아래 규칙 중 채점·
개인정보·교육과정 원문에 관한 것들은 일반적인 저장소보다 엄격하다.

먼저 [AGENTS.md](../AGENTS.md) 를 읽어라. 이 저장소의 작업 계약이며 사람과 AI 에이전트에 똑같이
적용된다.

## 환경 준비

Node 22 이상, pnpm 11 (`corepack enable`).

```bash
pnpm install      # husky 로 git hook 도 함께 설치된다
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
pnpm db:up && pnpm db:push && pnpm db:seed
pnpm dev
```

hook 이 동작하지 않으면 `pnpm install` 을 건너뛰었거나 `core.hooksPath` 가 덮인 것이다.
`pnpm prepare` 로 복구한다.

## 작업 방식

1. **`main` 에서 분기한다.** 이름은 `<타입>/<짧은-슬러그>` 이고 타입은 `feat`, `fix`, `docs`,
   `refactor`, `test`, `chore`, `ci` 중 하나다.
2. **변경을 작게 유지한다.** 한 브랜치는 리뷰 가능한 하나의 생각만 담는다. 설명에 "그리고 또"
   라고 쓰고 있다면 나눠라.
3. **소작업 단위로 커밋한다.** 한 커밋 = 하나의 논리적 변경. 관련 없는 수정을 묶지 않고, 끝난
   작업을 커밋하지 않은 채 다음 작업을 시작하지 않는다.
4. **커밋 전에 항상 `pnpm check`** — lint, 포맷 검사, 타입 체크. pre-commit hook 이 스테이지된
   파일에 lint-staged 를 돌리지만 이것을 대신하지는 않는다.
5. **커밋 메시지는 제목 + 요약 + 불릿으로 쓴다:**

   ```
   <제목: 명령형, 72자 이하, 무엇이 바뀌었는지>

   <요약: 1~3문장 — 왜 바꾸는지, 무엇에 영향을 주는지>

   - <불릿: 구체적인 변경 하나. 파일 또는 모듈 단위>
   - <불릿: 내린 결정, 검토했다가 버린 대안, 리뷰어가 확인할 것>
   ```

   제목만 쓰는 것은 오타 수정 같은 사소한 한 줄 변경에서만 허용된다.

## 코드 스타일

전체 규칙은 [AGENTS.md](../AGENTS.md) 에 있다. 자주 걸리는 것만 옮기면:

- TypeScript 는 `strict` + `noUncheckedIndexedAccess`. 배열 인덱싱 결과는 `undefined` 일 수
  있으니 좁혀서 쓴다.
- `apps/web` 은 `verbatimModuleSyntax` 를 쓴다. 타입만 쓰는 import 는 `import type` 으로.
- React 컴포넌트는 함수형 + **이름 있는** export. `export default` 는 쓰지 않는다.
- React Compiler 가 켜져 있다. `useMemo`/`useCallback`/`memo` 를 습관적으로 넣지 않는다.
  필요하면 이유를 주석으로 남긴다.
- 색은 Tailwind 토큰이나 `var(--color-*)` 로 쓴다. 컴포넌트에 hex 를 직접 넣지 않는다.
- 주석과 UI 문구는 한국어로 쓰고, 주석은 "왜"를 적는다.
- oxlint 와 oxfmt 만 쓴다. ESLint·Prettier 설정을 추가하지 않는다.

## 타협하지 않는 것

아래를 바꾸는 PR 은 되돌려 달라는 요청을 받는다:

1. **채점은 서버가 한다.** `progress.attempt()` 안에서 제출된 프로그램을 다시 실행해 판정한다.
   클라이언트가 보낸 성공 여부는 믿지 않는다.
2. **개인정보는 마스킹된 형태로만 나간다.** 사용자 데이터를 담는 모든 응답 경로는
   `apps/api/src/common/masking.ts` 를 거친다.
3. **감사 로그는 추가만 한다.** `audit_logs` 에 UPDATE/DELETE 를 쓰지 않는다.
4. **관리자 엔드포인트는 가드 두 개를 함께 붙인다**: `@UseGuards(JwtAuthGuard, RolesGuard)` 와
   `@Roles('admin')`.
5. **개념 색은 고정이고** 토큰으로만 쓴다.

## 테스트

- 인터프리터 변경은 테스트 없이 머지하지 않는다. `apps/api/test/interpreter.spec.ts` 에 케이스를
  추가하고 `pnpm --filter @coblocks/api test` 를 돌린다.
- 버그를 고칠 때는 실패하던 케이스를 함께 추가한다.

## 교육과정 콘텐츠

미션은 단순한 데이터 행이 아니라 교육 자료다.

- `STANDARDS` 에 없는 성취기준 코드라면 **고시 원문을 그대로** 추가한다. 요약하거나 현대적으로
  다듬지 않는다.
- 미션 하나에는 대표 개념 **하나**만 붙인다. 나머지는 `blockLabels` 로 드러낸다.
- 난이도는 학년군 **안에서의** 상대값이다. 초 5~6의 '심화'와 고등의 '입문'은 다른 척도다.
- 차시는 예시안이며, 교과서 단원과 1:1 대응한다고 쓰지 않는다.
- 초 3~4 미션은 `standardCode` 를 `null` 로 둔다. 없는 성취기준을 지어내지 않는다.

전체 규칙: [04-curriculum.md](04-curriculum.md).

## 문서

- 루트 문서(`README.md`, `CONTRIBUTING.md`)는 **영어**로 쓰고, 한국어 번역을
  `docs/<이름>.ko.md` 에 둔다.
- **두 버전은 같은 PR 에서 함께 바꾼다.** 영어만 고친 변경은 미완성이고, 한국어만 고친 것도
  마찬가지다.
- `.ko.md` 번역을 제외한 `docs/` 안의 문서는 한국어로 쓴다.
- 날짜별 작업 로그, 세션 메모, 변경 이력을 `AGENTS.md`·`README.md`·`docs/` 에 넣지 않는다.

## Pull Request

- `main` 을 대상으로 연다. CI(lint, 포맷, 타입 체크, 테스트, 빌드)가 초록이어야 한다.
- 라벨은 변경한 경로를 보고 labeler 워크플로가 자동으로 붙인다. 없는 라벨은 CI 가 만들므로 직접
  만들 필요가 없다.
- `CODEOWNERS` 에 따라 모든 경로의 소유자는 `@bluenyang` 이며 자동으로 리뷰어로 지정된다.
- 설명은 커밋 메시지와 같은 방식으로 쓴다 — 무엇을 왜, 그리고 불릿. UI 에 보이는 변경이면
  스크린샷을 붙인다.
- 아직 움직이는 중이면 draft 로 둔다.

## 문제 제보

- 버그와 제안은 이슈로 연다. 재현 절차, 기대 결과와 실제 결과, 관련된 학년군이나 미션을 적는다.
- **실제 학생 데이터를 절대 붙여넣지 않는다** — 이름, 이메일, 학번, 명렬표 스크린샷 등. 이슈·PR·
  테스트 픽스처 어디에도 넣지 말고 시드된 개발 계정을 쓴다.
- 보안이나 개인정보 관련 사안은 공개 이슈로 열지 말고 `contact@bluenyang.kr` 로 메일을 보낸다.

## 라이선스

기여하는 것으로, 당신의 기여가 이 프로젝트의 라이선스인
[Apache License 2.0](../LICENSE) 아래 배포되는 데 동의하는 것으로 본다.
