import { describe, expect, it } from 'vitest';
import { DEFAULT_STAGE, compile, run, type BlockProgram } from '@coblocks/shared';

describe('블록 인터프리터', () => {
  it('반복 블록을 펼친다', () => {
    const program: BlockProgram = [
      { kind: 'rep', count: 3 },
      { kind: 'fwd' },
      { kind: 'end' },
    ];
    expect(compile(program)).toHaveLength(3);
  });

  it('중첩 반복을 펼친다', () => {
    const program: BlockProgram = [
      { kind: 'rep', count: 2 },
      { kind: 'rep', count: 3 },
      { kind: 'fwd' },
      { kind: 'end' },
      { kind: 'end' },
    ];
    expect(compile(program)).toHaveLength(6);
  });

  it('짝이 맞지 않는 반복은 거부한다', () => {
    expect(compile([{ kind: 'rep', count: 2 }, { kind: 'fwd' }])).toBeNull();
    expect(compile([{ kind: 'end' }])).toBeNull();
    expect(run(DEFAULT_STAGE, [{ kind: 'end' }]).outcome).toBe('unbalanced');
  });

  it('벽에 부딪히면 crashed 를 낸다', () => {
    // 시작 (0,7) 동쪽 → (1,7) 은 통과, 그 다음 (2,7) 이 벽이다.
    const result = run(DEFAULT_STAGE, [{ kind: 'fwd' }, { kind: 'fwd' }]);
    expect(result.outcome).toBe('crashed');
    expect(result.failedAt).toBe(1);
  });

  it('목표에 닿지 못하면 missed_goal 을 낸다', () => {
    expect(run(DEFAULT_STAGE, [{ kind: 'fwd' }]).outcome).toBe('missed_goal');
  });
});
