/**
 * 블록 종류.
 * - `turn` 은 각도를 인자로 받는다. 예전의 `right`/`left` 를 `turn(+90)`/`turn(-90)` 으로 흡수했다.
 *   v0.1 은 90 의 배수만 허용하고, v0.9 에서 임의 각도를 연다 — 그때 이 타입은 바뀌지 않는다.
 * - `rep`/`end` 는 짝을 이루는 반복 블록.
 */
export type BlockKind = 'fwd' | 'turn' | 'rep' | 'end';

/** 기본 회전 단위(도). 시계 방향이 양수. */
export const TURN_STEP = 90;

export interface ProgramBlock {
  kind: BlockKind;
  /** 에디터 쪽 블록 id. 실행 중 하이라이트에 쓰며, 없어도 실행에는 지장이 없다. */
  id?: string;
  /** `rep` 일 때 반복 횟수 */
  count?: number;
  /** `turn` 일 때 회전 각도(도) */
  deg?: number;
}

export type BlockProgram = ProgramBlock[];

/** 인터프리터가 만들어내는 평탄화된 실행 단계 */
export interface ExecStep {
  kind: 'fwd' | 'turn';
  /** `turn` 일 때 회전 각도(도) */
  deg?: number;
  /** 원본 program 배열에서의 인덱스 — UI 하이라이트용 */
  sourceIndex: number;
  /** 원본 블록의 id */
  id?: string;
}

/** `invalid` 는 제출된 프로그램이 스키마를 어긴 경우다. 실행 자체를 하지 않는다. */
export type RunOutcome =
  | 'success'
  | 'missed_goal'
  | 'crashed'
  | 'unbalanced'
  | 'step_limit'
  | 'invalid';

export interface RunResult {
  outcome: RunOutcome;
  steps: ExecStep[];
  /** 실패한 단계의 인덱스 (invalid 면 문제가 된 블록의 인덱스) */
  failedAt: number | null;
}

/** 검증 실패 지점. `index` 가 null 이면 프로그램 전체에 대한 문제다. */
export interface ValidationIssue {
  index: number | null;
  reason: string;
}
