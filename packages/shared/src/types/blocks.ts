/** 블록 종류. rep/end 는 짝을 이루는 반복 블록. */
export type BlockKind = 'fwd' | 'right' | 'left' | 'rep' | 'end';

export interface ProgramBlock {
  kind: BlockKind;
  /** rep 일 때 반복 횟수 */
  count?: number;
}

export type BlockProgram = ProgramBlock[];

/** 인터프리터가 만들어내는 평탄화된 실행 단계 */
export interface ExecStep {
  kind: Exclude<BlockKind, 'rep' | 'end'>;
  /** 원본 program 배열에서의 인덱스 — UI 하이라이트용 */
  sourceIndex: number;
}

export type RunOutcome = 'success' | 'missed_goal' | 'crashed' | 'unbalanced' | 'step_limit';

export interface RunResult {
  outcome: RunOutcome;
  steps: ExecStep[];
  /** 실패한 단계의 인덱스 */
  failedAt: number | null;
}
