import { TURN_STEP } from '@coblocks/shared';
import type { ProgramBlock } from '@coblocks/shared';

/**
 * 팔레트는 완성된 블록을 그대로 넘긴다.
 * 회전은 각도를 가진 하나의 블록이므로 종류가 아니라 값으로 구분한다.
 */
const PALETTE: Array<{ key: string; block: ProgramBlock; label: string; cssVar: string }> = [
  { key: 'fwd', block: { kind: 'fwd' }, label: '앞으로 1칸', cssVar: '--color-seq' },
  {
    key: 'turn-right',
    block: { kind: 'turn', deg: TURN_STEP },
    label: '오른쪽으로 돌기',
    cssVar: '--color-seq',
  },
  {
    key: 'turn-left',
    block: { kind: 'turn', deg: -TURN_STEP },
    label: '왼쪽으로 돌기',
    cssVar: '--color-seq',
  },
  { key: 'rep', block: { kind: 'rep', count: 3 }, label: '3번 반복 시작', cssVar: '--color-loop' },
  { key: 'end', block: { kind: 'end' }, label: '반복 끝', cssVar: '--color-loop' },
];

export function BlockPalette({ onAdd }: { onAdd: (block: ProgramBlock) => void }) {
  return (
    <div className='mb-3.5 flex flex-wrap gap-2'>
      {PALETTE.map((b) => (
        <button
          key={b.block.kind}
          type='button'
          className='rounded-[9px] px-3.5 py-2 text-[13.5px] font-semibold text-white shadow-[0_2px_0_rgb(0_0_0/0.14)]'
          style={{ background: `var(${b.cssVar})` }}
          onClick={() => onAdd({ ...b.block })}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}
