import { useCallback, useEffect, useRef, useState } from 'react';

import { applyStep, compile, headingVector, MAX_STEPS, validateProgram } from '@coblocks/shared';
import type { BlockProgram, Pose, StageConfig } from '@coblocks/shared';

export type RunStatus = 'idle' | 'running' | 'success' | 'failed';

/** 다음 칸이 격자 밖인가 — 실패 이유를 벽 충돌과 구분하기 위해 본다. */
function isOutsideAhead(stage: StageConfig, pose: Pose): boolean {
  const vector = headingVector(pose.heading);
  if (!vector) return true;
  const nx = pose.x + vector[0];
  const ny = pose.y + vector[1];
  return nx < 0 || ny < 0 || nx >= stage.col || ny >= stage.row;
}

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
  /** 실행 중인 에디터 블록 id. Blockly 하이라이트에 쓴다. */
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
    setActiveIndex(null);
    setActiveBlockId(null);
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

      // 서버가 거부할 제출은 화면에서 먼저 걸러 준다 — 같은 검증 함수를 쓴다.
      const issue = validateProgram(program);
      if (issue) {
        setStatus('failed');
        setMessage(`블록을 실행할 수 없어요: ${issue.reason}`);
        return;
      }

      const steps = compile(program);
      if (!steps) {
        setStatus('failed');
        setMessage('반복 블록의 짝이 맞지 않아요. 반복 안에 블록이 들어 있는지 확인해 보세요.');
        return;
      }
      if (steps.length > MAX_STEPS) {
        setStatus('failed');
        setMessage(
          `움직임이 ${MAX_STEPS}번을 넘었어요. 반복 횟수를 줄이거나 더 짧은 길을 찾아볼까요?`,
        );
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
        setActiveBlockId(step.id ?? null);

        const next = applyStep(stage, current, step);
        if (!next) {
          stop();
          setStatus('failed');
          // 벽인지 격자 밖인지 구분해서 알려 준다. "부딪혔다"만으로는 어디를 고칠지 모른다.
          setMessage(
            isOutsideAhead(stage, current)
              ? '격자 밖으로 나가려고 했어요. 여기서 방향을 돌려 볼까요?'
              : '벽에 부딪혔어요. 벽을 피해 돌아가는 길을 찾아볼까요?',
          );
          return;
        }
        current = next;
        setPose(current);
      }, stepMs);
    },
    [stage, stepMs, stop],
  );

  return { pose, status, message, activeIndex, activeBlockId, run, reset };
}
