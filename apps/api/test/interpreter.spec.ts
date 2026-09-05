import { describe, expect, it } from 'vitest';

import {
  DEFAULT_STAGE,
  compile,
  headingVector,
  isSupportedAngle,
  normalizeHeading,
  run,
  validateProgram,
  validateStage,
  type BlockProgram,
  type StageConfig,
} from '@coblocks/shared';

/** 시작 (0,7) 에서 오른쪽(heading 90)을 본다. (2,7) 이 벽이다. */
const fwd = (): BlockProgram[number] => ({ kind: 'fwd' });
const turn = (deg: number): BlockProgram[number] => ({ kind: 'turn', deg });

describe('블록 인터프리터', () => {
  it('반복 블록을 펼친다', () => {
    const program: BlockProgram = [{ kind: 'rep', count: 3 }, fwd(), { kind: 'end' }];
    expect(compile(program)).toHaveLength(3);
  });

  it('중첩 반복을 펼친다', () => {
    const program: BlockProgram = [
      { kind: 'rep', count: 2 },
      { kind: 'rep', count: 3 },
      fwd(),
      { kind: 'end' },
      { kind: 'end' },
    ];
    expect(compile(program)).toHaveLength(6);
  });

  it('짝이 맞지 않는 반복은 거부한다', () => {
    expect(compile([{ kind: 'rep', count: 2 }, fwd()])).toBeNull();
    expect(compile([{ kind: 'end' }])).toBeNull();
    expect(run(DEFAULT_STAGE, [{ kind: 'end' }]).outcome).toBe('unbalanced');
  });

  it('블록 id 를 실행 단계로 옮긴다 — 에디터 하이라이트용', () => {
    const steps = compile([{ kind: 'fwd', id: 'blk-1' }]);
    expect(steps?.[0]?.id).toBe('blk-1');
    expect(steps?.[0]?.sourceIndex).toBe(0);
  });

  it('벽에 부딪히면 crashed 를 낸다', () => {
    // (1,7) 은 통과, 그 다음 (2,7) 이 벽이다.
    const result = run(DEFAULT_STAGE, [fwd(), fwd()]);
    expect(result.outcome).toBe('crashed');
    expect(result.failedAt).toBe(1);
  });

  it('격자 밖으로 나가도 crashed 를 낸다', () => {
    // 위(heading 0)를 보고 계속 가면 y=0 을 지나 격자를 벗어난다.
    const result = run(DEFAULT_STAGE, [turn(-90), ...Array.from({ length: 8 }, fwd)]);
    expect(result.outcome).toBe('crashed');
  });

  it('목표에 닿지 못하면 missed_goal 을 낸다', () => {
    expect(run(DEFAULT_STAGE, [fwd()]).outcome).toBe('missed_goal');
  });

  it('목표에 닿으면 success 를 낸다', () => {
    // (0,7) → 위로 6칸 → (0,1) → 오른쪽으로 6칸 → (6,1) = 목표
    const program: BlockProgram = [
      turn(-90),
      ...Array.from({ length: 6 }, fwd),
      turn(90),
      ...Array.from({ length: 6 }, fwd),
    ];
    expect(run(DEFAULT_STAGE, program).outcome).toBe('success');
  });
});

describe('각도 기반 방향', () => {
  it('heading 을 0~359 로 정규화한다', () => {
    expect(normalizeHeading(-90)).toBe(270);
    expect(normalizeHeading(450)).toBe(90);
    expect(normalizeHeading(360)).toBe(0);
  });

  it('0=위 90=오른쪽 180=아래 270=왼쪽 (y 는 아래로 증가)', () => {
    expect(headingVector(0)).toEqual([0, -1]);
    expect(headingVector(90)).toEqual([1, 0]);
    expect(headingVector(180)).toEqual([0, 1]);
    expect(headingVector(270)).toEqual([-1, 0]);
  });

  it('v0.1 은 90 의 배수만 지원한다', () => {
    expect(isSupportedAngle(90)).toBe(true);
    expect(isSupportedAngle(-180)).toBe(true);
    expect(isSupportedAngle(45)).toBe(false);
    expect(headingVector(45)).toBeNull();
  });

  it('회전을 네 번 하면 제자리로 돌아온다', () => {
    const program: BlockProgram = [turn(90), turn(90), turn(90), turn(90), fwd()];
    // 다시 오른쪽을 보므로 (1,7) 로 한 칸 간 것과 같다 — 목표는 아니다.
    expect(run(DEFAULT_STAGE, program).outcome).toBe('missed_goal');
  });
});

describe('제출 검증', () => {
  it('올바른 프로그램은 통과한다', () => {
    expect(
      validateProgram([fwd(), turn(90), { kind: 'rep', count: 2 }, { kind: 'end' }]),
    ).toBeNull();
  });

  it('배열이 아니면 거부한다', () => {
    expect(validateProgram({ kind: 'fwd' })?.index).toBeNull();
    expect(validateProgram(null)).not.toBeNull();
  });

  it('알 수 없는 블록 종류를 거부한다', () => {
    expect(validateProgram([{ kind: 'teleport' }])?.index).toBe(0);
  });

  it('90 의 배수가 아닌 회전을 거부한다', () => {
    expect(validateProgram([turn(45)])?.index).toBe(0);
  });

  it('반복 횟수 범위를 지킨다', () => {
    expect(validateProgram([{ kind: 'rep', count: 0 }])?.index).toBe(0);
    expect(validateProgram([{ kind: 'rep', count: 1000 }])?.index).toBe(0);
    expect(validateProgram([{ kind: 'rep', count: 1.5 }])?.index).toBe(0);
  });

  it('검증에 걸린 제출은 실행하지 않고 invalid 를 낸다', () => {
    const result = run(DEFAULT_STAGE, [turn(45)]);
    expect(result.outcome).toBe('invalid');
    expect(result.steps).toHaveLength(0);
  });

  it('기본 스테이지는 유효하다', () => {
    expect(validateStage(DEFAULT_STAGE)).toBeNull();
  });

  it('격자 밖 목표나 90 의 배수가 아닌 시작 방향을 거부한다', () => {
    const outside: StageConfig = { ...DEFAULT_STAGE, goal: { x: 99, y: 0 } };
    expect(validateStage(outside)).not.toBeNull();
    const skewed: StageConfig = { ...DEFAULT_STAGE, start: { x: 0, y: 0, heading: 45 } };
    expect(validateStage(skewed)).not.toBeNull();
  });

  it('비정사각 스테이지도 유효하다 — 저장 형식은 이미 col/row 다', () => {
    const wide: StageConfig = {
      col: 10,
      row: 4,
      start: { x: 0, y: 0, heading: 90 },
      goal: { x: 9, y: 3 },
      walls: [],
    };
    expect(validateStage(wide)).toBeNull();
  });
});
