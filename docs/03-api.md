# API 명세

기본 prefix `/api`. 명시가 없으면 `Authorization: Bearer <JWT>` 필요.

## 인증

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| POST | `/auth/login` | 공개. `{ loginId, password }` → `{ accessToken, user }`. 실패해도 계정 존재 여부를 구분해 알리지 않는다 |
| GET | `/auth/me` | 현재 사용자 |
| POST | `/auth/logout` | 감사 로그만 남긴다(JWT는 서버 세션이 없음) |

## 학습

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| GET | `/lessons` | 목록. `q`, `bands`, `concepts`, `levels`(모두 콤마 구분), `page`, `pageSize`. 기본 `status=published` |
| GET | `/lessons/:slug` | 단건. `stage` 포함 |
| GET | `/progress/me` | 내 진도 전체 |
| POST | `/progress/:lessonId/attempt` | `{ program: BlockProgram }` → `RunResult`. **서버가 다시 채점**하고 진도를 갱신 |

`RunResult.outcome`: `success` / `missed_goal` / `crashed` / `unbalanced` / `step_limit`

## 관리자 (`admin` 역할 전용)

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| GET | `/admin/overview` | 오늘 로그인·실패·활동 수, 시간대별 접속, 서비스 상태 |
| GET | `/admin/audit-logs` | `q`, `categories`, `page`. 최신순 50건 |
| GET | `/admin/users` | 마스킹된 사용자 목록. `q`(회원번호·학교), `page` |
| POST | `/admin/users/:id/unmask-requests` | `{ reason }`(5자 이상). 즉시 해제하지 않고 요청만 생성 |
| GET | `/admin/lessons` | 전체 미션(임시저장 포함) |
| POST | `/admin/lessons` | 미션 생성. 리비전 스냅샷 + 감사 로그 |
| PATCH | `/admin/lessons/:id` | 미션 수정. 리비전 스냅샷 + 감사 로그 |
| GET | `/admin/inquiries` | 문의 목록 |
| POST | `/admin/inquiries/:id/answer` | `{ answer }` |
| POST | `/admin/inquiries/:id/hold` | 보류 처리 |

## 오류 형식

NestJS 기본 형식을 그대로 쓴다.

```json
{ "statusCode": 403, "message": "권한이 없습니다.", "error": "Forbidden" }
```

검증 실패(400)는 `message` 가 배열로 온다. 프론트는 첫 항목을 보여주면 된다.

## 아직 없는 것

- `/progress/me/activity` — 대시보드 최근 활동 (지금은 진도 목록으로 대체)
- `/admin/unmask-requests/:id/approve` — 마스킹 해제 승인
- `/inquiries` — 학생·교사가 문의를 등록하는 공개 엔드포인트
- `/classes` — 학급 단위 진도
