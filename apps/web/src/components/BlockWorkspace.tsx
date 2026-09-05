// 이 화면에서는 배열 인덱스가 곧 블록의 정체성이다. 인터프리터가 돌려주는
// ExecStep.sourceIndex, 하이라이트용 activeIndex, onRemove(i)/onSetCount(i) 가
// 모두 같은 인덱스를 가리키므로 별도의 id 를 만들면 오히려 두 체계가 갈린다.
/* oxlint-disable react/no-array-index-key */
import type { BlockKind, BlockProgram } from '@coblocks/shared';

const LABEL: Record<BlockKind, string> = {
  fwd: '앞으로 1칸',
  right: '오른쪽으로 돌기',
  left: '왼쪽으로 돌기',
  rep: '번 반복 시작',
  end: '반복 끝',
};
const COLOR: Record<BlockKind, string> = {
  fwd: '--color-seq',
  right: '--color-seq',
  left: '--color-seq',
  rep: '--color-loop',
  end: '--color-loop',
};
const COUNTS = [2, 3, 4, 5, 6, 8];

interface Props {
  program: BlockProgram;
  activeIndex: number | null;
  onRemove: (index: number) => void;
  onSetCount: (index: number, count: number) => void;
}

/** 반복 블록 안쪽을 들여쓴다 — 중첩 구조가 눈에 보이도록. */
function depthsOf(program: BlockProgram): number[] {
  let depth = 0;
  return program.map((b) => {
    if (b.kind === 'end') depth = Math.max(0, depth - 1);
    const current = depth;
    if (b.kind === 'rep') depth++;
    return current;
  });
}

export function BlockWorkspace({ program, activeIndex, onRemove, onSetCount }: Props) {
  const depths = depthsOf(program);

  return (
    <div className='flex min-h-[190px] flex-col items-start gap-1.5 rounded-xl border border-dashed border-line-strong bg-surface p-3'>
      {program.length === 0 && (
        <p className='m-auto text-center text-[13.5px] text-muted'>
          위의 블록을 눌러 순서대로 쌓아 보세요.
        </p>
      )}

      {program.map((block, i) => (
        <div
          key={i}
          className='flex min-w-[190px] items-center gap-2.5 rounded-[9px] py-2 pr-2.5 pl-3 text-[13.5px] font-semibold text-white'
          style={{
            background: `var(${COLOR[block.kind]})`,
            marginLeft: `${(depths[i] ?? 0) * 18}px`,
            outline: activeIndex === i ? '3px solid var(--color-accent)' : undefined,
            outlineOffset: '2px',
          }}
        >
          {block.kind === 'rep' && (
            <select
              className='rounded-md border-0 px-1 py-0.5 text-[13px] text-black'
              value={block.count ?? 3}
              onChange={(e) => onSetCount(i, Number(e.target.value))}
              aria-label='반복 횟수'
            >
              {COUNTS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          )}
          <span>{LABEL[block.kind]}</span>
          <button
            type='button'
            className='ml-auto grid h-5 w-5 place-items-center rounded-md bg-white/25 text-[13px] leading-none'
            aria-label='블록 삭제'
            onClick={() => onRemove(i)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
