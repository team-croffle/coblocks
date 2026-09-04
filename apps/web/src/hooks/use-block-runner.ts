import { useCallback, useEffect, useRef, useState } from 'react';

import { applyStep, compile } from '@coblocks/shared';
import type { BlockProgram, Pose, StageConfig } from '@coblocks/shared';

export type RunStatus = 'idle' | 'running' | 'success' | 'failed';

const IDLE_MESSAGE = '실행 버튼을 누르면 블록이 위에서부터 차례로 실행됩니다.';

/**
 * 스테이지 실행을 한 단계씩 애니메이션한다.
 * 판정 규칙 자체는 shared 의 compile/applyStep 을 그대로 쓰므로 서버 채점과 어긋나지 않는다.
 */
export function useBlockRunner(stage: StageConfig, stepMs = 430) {
  const [pose, setPose] = useState<Pose>(() => ({ ...stage.start }));
  const [status, setStatus] = useState<RunStatus>('idle');
  const [message, setMessage] = useState(IDLE_MESSAGE);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const timer = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
    setActiveIndex(null);
  }, []);

  // 미션을 옮기거나 화면을 떠날 때 타이머가 남지 않도록.
  useEffect(() => stop, [stop]);

  const reset = useCallback(
    (msg?: string) => {
      stop();
      setPose({ ...stage.start });
      setStatus('idle');
      setMessage(msg ?? IDLE_MESSAGE);
    },
    [stage, stop],
  );

  const run = useCallback(
    (program: BlockProgram) => {
      stop();

      if (program.length === 0) {
        setStatus('failed');
        setMessage('먼저 블록을 하나 이상 쌓아 주세요.');
        return;
      }

      const steps = compile(program);
      if (!steps) {
        setStatus('failed');
        setMessage('반복 블록의 짝이 맞지 않아요. ‘반복 시작’과 ‘반복 끝’을 확인해 보세요.');
        return;
      }

      let current: Pose = { ...stage.start };
      setPose(current);
      setStatus('running');
      setMessage('실행 중…');

      let i = 0;
      timer.current = window.setInterval(() => {
        if (i >= steps.length) {
          stop();
          const reached = current.x === stage.goal.x && current.y === stage.goal.y;
          setStatus(reached ? 'success' : 'failed');
          setMessage(
            reached
              ? '★ 별에 도착했어요! 미션 성공'
              : '블록이 모두 끝났지만 별에 닿지 못했어요. 순서를 다시 살펴볼까요?',
          );
          return;
        }

        const step = steps[i++];
        if (!step) return;
        setActiveIndex(step.sourceIndex);

        const next = applyStep(stage, current, step);
        if (!next) {
          stop();
          setStatus('failed');
          setMessage('벽에 부딪혔어요. 여기서 방향을 돌려 볼까요?');
          return;
        }
        current = next;
        setPose(current);
      }, stepMs);
    },
    [stage, stepMs, stop],
  );

  return { pose, status, message, activeIndex, run, reset };
}
