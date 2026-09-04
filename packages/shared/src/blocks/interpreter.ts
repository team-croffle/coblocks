import type {
  BlockProgram,
  ExecStep,
  ProgramBlock,
  RunResult,
  ValidationIssue,
} from '../types/blocks';
import type { StageConfig } from '../types/curriculum';

/** 실행 폭주 방지 상한 */
export const MAX_STEPS = 500;
/** 제출 프로그램의 블록 수 상한 — 서버가 믿지 않는 입력이므로 크기부터 막는다. */
export const MAX_PROGRAM_BLOCKS = 500;
/** 반복 횟수 상한 */
export const MAX_REPEAT_COUNT = 100;

const BLOCK_KINDS = ['fwd', 'turn', 'rep', 'end'] as const;

/**
 * heading(도) → 이동 벡터. 0=위, 90=오른쪽, 180=아래, 270=왼쪽.
 * y 는 아래로 증가한다(격자 인덱스와 같은 방향).
 */
const HEADING_VECTORS: Readonly<Record<number, readonly [number, number]>> = {
  0: [0, -1],
  90: [1, 0],
  180: [0, 1],
  270: [-1, 0],
};

export const normalizeHeading = (deg: number): number => ((deg % 360) + 360) % 360;

/**
 * v0.1 이 지원하는 각도인가.
 * 임의 각도(45도 등)를 여는 v0.9 에서는 이 함수와 headingVector 만 고치면 된다.
 */
export const isSupportedAngle = (deg: number): boolean => Number.isInteger(deg) && deg % 90 === 0;

export function headingVector(heading: number): readonly [number, number] | null {
  return HEADING_VECTORS[normalizeHeading(heading)] ?? null;
}

export const isWall = (stage: StageConfig, x: number, y: number): boolean =>
  stage.walls.some(([wx, wy]) => wx === x && wy === y);

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * 제출된 프로그램이 스키마를 지키는지 본다. 문제가 없으면 null.
 * 클라이언트가 보낸 것을 그대로 실행하지 않기 위한 관문이므로 서버가 반드시 먼저 호출한다.
 */
export function validateProgram(program: unknown): ValidationIssue | null {
  if (!Array.isArray(program)) return { index: null, reason: '프로그램이 배열이 아닙니다.' };
  if (program.length > MAX_PROGRAM_BLOCKS) {
    return { index: null, reason: `블록이 너무 많습니다(최대 ${MAX_PROGRAM_BLOCKS}개).` };
  }

  for (let i = 0; i < program.length; i++) {
    const block = program[i];
    if (!isRecord(block)) return { index: i, reason: '블록이 객체가 아닙니다.' };

    const kind = block['kind'];
    if (typeof kind !== 'string' || !(BLOCK_KINDS as readonly string[]).includes(kind)) {
      return { index: i, reason: `알 수 없는 블록 종류입니다: ${String(kind)}` };
    }

    const id = block['id'];
    if (id !== undefined && typeof id !== 'string') {
      return { index: i, reason: '블록 id 는 문자열이어야 합니다.' };
    }

    if (kind === 'rep') {
      const count = block['count'];
      if (count !== undefined) {
        if (typeof count !== 'number' || !Number.isInteger(count)) {
          return { index: i, reason: '반복 횟수는 정수여야 합니다.' };
        }
        if (count < 1 || count > MAX_REPEAT_COUNT) {
          return { index: i, reason: `반복 횟수는 1 이상 ${MAX_REPEAT_COUNT} 이하여야 합니다.` };
        }
      }
    }

    if (kind === 'turn') {
      const deg = block['deg'];
      if (deg !== undefined && (typeof deg !== 'number' || !isSupportedAngle(deg))) {
        return { index: i, reason: '회전 각도는 90의 배수여야 합니다.' };
      }
    }
  }

  return null;
}

/** 스테이지 정의가 온전한지 본다. 관리자가 등록한 값도 믿지 않는다. */
export function validateStage(stage: unknown): ValidationIssue | null {
  if (!isRecord(stage)) return { index: null, reason: '스테이지가 객체가 아닙니다.' };

  const col = stage['col'];
  const row = stage['row'];
  if (typeof col !== 'number' || !Number.isInteger(col) || col < 1) {
    return { index: null, reason: 'col 은 1 이상의 정수여야 합니다.' };
  }
  if (typeof row !== 'number' || !Number.isInteger(row) || row < 1) {
    return { index: null, reason: 'row 는 1 이상의 정수여야 합니다.' };
  }

  const inBounds = (point: unknown): boolean => {
    if (!isRecord(point)) return false;
    const x = point['x'];
    const y = point['y'];
    return (
      typeof x === 'number' &&
      typeof y === 'number' &&
      Number.isInteger(x) &&
      Number.isInteger(y) &&
      x >= 0 &&
      y >= 0 &&
      x < col &&
      y < row
    );
  };

  const start = stage['start'];
  if (!isRecord(start) || !inBounds(start)) {
    return { index: null, reason: '시작 지점이 격자 밖입니다.' };
  }
  const heading = start['heading'];
  if (typeof heading !== 'number' || !isSupportedAngle(heading)) {
    return { index: null, reason: '시작 방향은 90의 배수여야 합니다.' };
  }

  if (!inBounds(stage['goal'])) return { index: null, reason: '목표 지점이 격자 밖입니다.' };

  const walls = stage['walls'];
  if (!Array.isArray(walls)) return { index: null, reason: 'walls 가 배열이 아닙니다.' };
  for (const wall of walls) {
    if (!Array.isArray(wall) || wall.length !== 2) {
      return { index: null, reason: '벽은 [x, y] 형태여야 합니다.' };
    }
  }

  return null;
}

/**
 * 반복 블록을 펼쳐 평탄한 실행 단계 목록으로 만든다.
 * rep/end 짝이 맞지 않거나 단계 수가 상한을 넘으면 null.
 */
export function compile(program: BlockProgram): ExecStep[] | null {
  const steps: ExecStep[] = [];

  const push = (block: ProgramBlock, sourceIndex: number): void => {
    const step: ExecStep = { kind: block.kind === 'turn' ? 'turn' : 'fwd', sourceIndex };
    if (block.kind === 'turn') step.deg = block.deg ?? 0;
    if (block.id !== undefined) step.id = block.id;
    steps.push(step);
  };

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
        push(block, i);
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
  /** 도(度). 0=위, 90=오른쪽, 180=아래, 270=왼쪽 */
  heading: number;
}

/** 한 단계 적용. 벽/격자 밖이면 null 을 돌려 충돌을 알린다. */
export function applyStep(stage: StageConfig, pose: Pose, step: ExecStep): Pose | null {
  if (step.kind === 'turn') {
    return { ...pose, heading: normalizeHeading(pose.heading + (step.deg ?? 0)) };
  }

  const vector = headingVector(pose.heading);
  if (!vector) return null;
  const nx = pose.x + vector[0];
  const ny = pose.y + vector[1];
  if (nx < 0 || ny < 0 || nx >= stage.col || ny >= stage.row) return null;
  if (isWall(stage, nx, ny)) return null;
  return { ...pose, x: nx, y: ny };
}

/**
 * 애니메이션 없이 결과만 계산한다.
 * 서버 채점과 클라이언트 미리보기가 같은 판정을 쓰도록 shared 에 둔다.
 */
export function run(stage: StageConfig, program: BlockProgram): RunResult {
  const issue = validateProgram(program);
  if (issue) return { outcome: 'invalid', steps: [], failedAt: issue.index };

  const steps = compile(program);
  if (!steps) return { outcome: 'unbalanced', steps: [], failedAt: null };
  if (steps.length > MAX_STEPS) return { outcome: 'step_limit', steps, failedAt: null };

  let pose: Pose = { ...stage.start };
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (!step) continue;
    const next = applyStep(stage, pose, step);
    if (!next) return { outcome: 'crashed', steps, failedAt: i };
    pose = next;
  }

  const reached = pose.x === stage.goal.x && pose.y === stage.goal.y;
  return { outcome: reached ? 'success' : 'missed_goal', steps, failedAt: null };
}
