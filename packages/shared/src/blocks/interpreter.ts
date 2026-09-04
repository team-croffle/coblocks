import type { BlockProgram, ExecStep, RunResult } from '../types/blocks';
import type { StageConfig } from '../types/curriculum';

/** 실행 폭주 방지 상한 */
export const MAX_STEPS = 500;

/** 방향 인덱스 → 이동 벡터 (0:동 1:남 2:서 3:북) */
export const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

/**
 * 반복 블록을 펼쳐 평탄한 실행 단계 목록으로 만든다.
 * rep/end 짝이 맞지 않거나 단계 수가 상한을 넘으면 null.
 */
export function compile(program: BlockProgram): ExecStep[] | null {
  const steps: ExecStep[] = [];

  const walk = (from: number, to: number): boolean => {
    for (let i = from; i < to; i++) {
      const block = program[i];
      if (!block) return false;

      if (block.kind === 'rep') {
        let depth = 1;
        let j = i + 1;
        while (j < to) {
          const b = program[j];
          if (b?.kind === 'rep') depth++;
          if (b?.kind === 'end') {
            depth--;
            if (depth === 0) break;
          }
          j++;
        }
        if (j >= to) return false; // 짝이 없는 반복 시작
        const count = Math.max(1, block.count ?? 1);
        for (let r = 0; r < count; r++) {
          if (!walk(i + 1, j)) return false;
        }
        i = j;
      } else if (block.kind === 'end') {
        return false; // 짝이 없는 반복 끝
      } else {
        steps.push({ kind: block.kind, sourceIndex: i });
        if (steps.length > MAX_STEPS) return false;
      }
    }
    return true;
  };

  return walk(0, program.length) ? steps : null;
}

export interface Pose {
  x: number;
  y: number;
  dir: number;
}

export const isWall = (stage: StageConfig, x: number, y: number): boolean =>
  stage.walls.some(([wx, wy]) => wx === x && wy === y);

/** 한 단계 적용. 벽/격자 밖이면 null 을 돌려 충돌을 알린다. */
export function applyStep(stage: StageConfig, pose: Pose, kind: ExecStep['kind']): Pose | null {
  if (kind === 'right') return { ...pose, dir: (pose.dir + 1) % 4 };
  if (kind === 'left') return { ...pose, dir: (pose.dir + 3) % 4 };

  const vector = DIRECTIONS[pose.dir];
  if (!vector) return null;
  const nx = pose.x + vector[0];
  const ny = pose.y + vector[1];
  if (nx < 0 || ny < 0 || nx >= stage.size || ny >= stage.size) return null;
  if (isWall(stage, nx, ny)) return null;
  return { ...pose, x: nx, y: ny };
}

/**
 * 애니메이션 없이 결과만 계산한다.
 * 서버 채점과 클라이언트 미리보기가 같은 판정을 쓰도록 shared 에 둔다.
 */
export function run(stage: StageConfig, program: BlockProgram): RunResult {
  const steps = compile(program);
  if (!steps) return { outcome: 'unbalanced', steps: [], failedAt: null };
  if (steps.length > MAX_STEPS) return { outcome: 'step_limit', steps, failedAt: null };

  let pose: Pose = { ...stage.start };
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (!step) continue;
    const next = applyStep(stage, pose, step.kind);
    if (!next) return { outcome: 'crashed', steps, failedAt: i };
    pose = next;
  }

  const reached = pose.x === stage.goal.x && pose.y === stage.goal.y;
  return { outcome: reached ? 'success' : 'missed_goal', steps, failedAt: null };
}
