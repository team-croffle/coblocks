# 데이터 모델

스키마 원본: `apps/api/src/db/schema.ts`

## 테이블

| 테이블 | 역할 | 비고 |
| --- | --- | --- |
| `users` | 계정 | `name`/`email` 은 원본. 응답에 담기 전 반드시 마스킹 |
| `standards` | 성취기준 코드와 고시 원문 | `lessons.standard_code` 가 참조 |
| `lessons` | 미션 | `stage` 는 `StageConfig` JSON, null 이면 언플러그드 활동 |
| `lesson_revisions` | 미션 수정 스냅샷 | 누가 언제 무엇을 바꿨는지 추적 |
| `progress` | 학생×미션 진도 | `(user_id, lesson_id)` 유니크 |
| `audit_logs` | 접속·활동·관리 로그 | **append-only** |
| `unmask_requests` | 개인정보 열람 요청 | 사유·승인자·만료 시각 |
| `inquiries` | 문의와 답변 | |

## 관계

```
users 1─┬─* progress *─1 lessons *─1 standards
        ├─* audit_logs (actor)
        ├─* unmask_requests (requester / target / approver)
        └─* inquiries (author / answered_by)

lessons 1─* lesson_revisions
```

## 설계 메모

- `audit_logs.actor_label` 은 회원번호를 **문자열로 복제**해 둔다. 계정이 삭제돼도 로그의 주체를 식별할 수 있어야 하기 때문이다. `actor_id` 는 참조 무결성용.
- `progress.program` 에 마지막 블록 프로그램을 통째로 저장한다. 블록 종류가 늘어도 스키마 변경이 없다. 대신 오래된 프로그램은 새 인터프리터에서 못 돌 수 있으므로, 블록 종류를 제거할 때는 마이그레이션 스크립트를 함께 쓴다.
- `lessons.level` 은 1~3 smallint. enum 으로 두지 않은 이유는 난이도 단계가 늘어날 여지가 있어서다. 값 검증은 애플리케이션에서 한다.
- 학급/반은 아직 없다. 교사가 학생 진도를 보려면 `classes`, `class_members` 가 필요하다 — 로드맵 참고.

## 인덱스

- `lessons(band, concept)` — 커리큘럼 필터
- `audit_logs(occurred_at desc)`, `audit_logs(category)` — 감사 조회
- `progress(user_id, lesson_id)` unique — upsert 키

## 운영 권한

감사 로그는 애플리케이션에서 INSERT만 하지만, DB 사용자에게도 그렇게 강제하는 편이 안전하다.

```sql
REVOKE UPDATE, DELETE ON audit_logs FROM coblocks_app;
```
