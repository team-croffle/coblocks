import { isWall } from '@coblocks/shared';
import type { Pose, StageConfig } from '@coblocks/shared';

interface Props {
  stage: StageConfig;
  pose: Pose;
}

export function StageCanvas({ stage, pose }: Props) {
  const unitX = 100 / stage.col;
  const unitY = 100 / stage.row;
  const cells = Array.from({ length: stage.col * stage.row }, (_, i) => {
    const x = i % stage.col;
    const y = Math.floor(i / stage.col);
    return { x, y, wall: isWall(stage, x, y), goal: stage.goal.x === x && stage.goal.y === y };
  });

  return (
    <div className='mx-auto max-w-[420px]'>
      <div
        className='relative overflow-hidden rounded-xl border border-line bg-surface'
        style={{ aspectRatio: `${stage.col} / ${stage.row}` }}
      >
        <div
          className='absolute inset-0 grid'
          style={{
            gridTemplateColumns: `repeat(${stage.col}, 1fr)`,
            gridTemplateRows: `repeat(${stage.row}, 1fr)`,
          }}
        >
          {cells.map((c) => (
            <div
              key={`${c.x}-${c.y}`}
              className='border-r border-b border-line'
              style={{
                background: c.wall
                  ? 'var(--color-line-strong)'
                  : c.goal
                    ? 'color-mix(in srgb, var(--color-loop) 22%, transparent)'
                    : 'transparent',
              }}
            />
          ))}
        </div>

        <div
          className='absolute grid place-items-center text-xl text-loop'
          style={{
            width: `${unitX}%`,
            height: `${unitY}%`,
            transform: `translate(${stage.goal.x * 100}%, ${stage.goal.y * 100}%)`,
          }}
          aria-hidden='true'
        >
          ★
        </div>

        <div
          className='absolute grid place-items-center transition-transform duration-200'
          style={{
            width: `${unitX}%`,
            height: `${unitY}%`,
            transform: `translate(${pose.x * 100}%, ${pose.y * 100}%)`,
          }}
        >
          <span
            className='grid h-2/3 w-2/3 place-items-center rounded-lg bg-seq text-[13px] text-white transition-transform duration-200'
            style={{ rotate: `${pose.heading - 90}deg` }}
          >
            ▶
          </span>
        </div>
      </div>
    </div>
  );
}
