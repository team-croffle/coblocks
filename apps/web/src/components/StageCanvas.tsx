import { isWall } from '@coblocks/shared';
import type { Pose, StageConfig } from '@coblocks/shared';

interface Props {
  stage: StageConfig;
  pose: Pose;
}

const HEADING_LABEL: Record<number, string> = {
  0: '위쪽',
  90: '오른쪽',
  180: '아래쪽',
  270: '왼쪽',
};

/**
 * 스테이지 상태를 문장으로 만든다.
 * canvas 든 격자 div 든 스크린리더에는 잡히지 않는다. 화면을 보지 않는 학습자도
 * 지금 어디에서 어느 쪽을 보고 있는지 알 수 있어야 한다.
 */
function describe(stage: StageConfig, pose: Pose): string {
  const heading = HEADING_LABEL[((pose.heading % 360) + 360) % 360] ?? `${pose.heading}도`;
  const dx = stage.goal.x - pose.x;
  const dy = stage.goal.y - pose.y;
  if (dx === 0 && dy === 0) return `별 위에 있고 ${heading}을 보고 있습니다.`;

  const parts: string[] = [];
  if (dx !== 0)
    parts.push(`오른쪽으로 ${Math.abs(dx)}칸`.replace('오른쪽', dx > 0 ? '오른쪽' : '왼쪽'));
  if (dy !== 0) parts.push(`아래로 ${Math.abs(dy)}칸`.replace('아래', dy > 0 ? '아래' : '위'));
  return `${stage.col}칸 × ${stage.row}칸 격자입니다. 현재 위치는 가로 ${pose.x + 1}, 세로 ${pose.y + 1}이고 ${heading}을 보고 있습니다. 별까지 ${parts.join(', ')} 남았습니다.`;
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
      {/* 격자 자체는 시각 요소다. 같은 내용을 문장으로도 내보낸다. */}
      <p className='sr-only' role='status'>
        {describe(stage, pose)}
      </p>
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
