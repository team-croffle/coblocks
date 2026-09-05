import type { BlockKind } from '@coblocks/shared';

const PALETTE: Array<{ kind: BlockKind; label: string; cssVar: string }> = [
  { kind: 'fwd', label: '앞으로 1칸', cssVar: '--color-seq' },
  { kind: 'right', label: '오른쪽으로 돌기', cssVar: '--color-seq' },
  { kind: 'left', label: '왼쪽으로 돌기', cssVar: '--color-seq' },
  { kind: 'rep', label: '3번 반복 시작', cssVar: '--color-loop' },
  { kind: 'end', label: '반복 끝', cssVar: '--color-loop' },
];

export function BlockPalette({ onAdd }: { onAdd: (kind: BlockKind) => void }) {
  return (
    <div className='mb-3.5 flex flex-wrap gap-2'>
      {PALETTE.map((b) => (
        <button
          key={b.kind}
          type='button'
          className='rounded-[9px] px-3.5 py-2 text-[13.5px] font-semibold text-white shadow-[0_2px_0_rgb(0_0_0/0.14)]'
          style={{ background: `var(${b.cssVar})` }}
          onClick={() => onAdd(b.kind)}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}
