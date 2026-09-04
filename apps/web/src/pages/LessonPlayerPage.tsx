import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import { useState } from 'react';

import {
  DEFAULT_STAGE,
  LESSON_SEED,
  STANDARD_TEXT,
  type BlockProgram,
  type ProgramBlock,
} from '@coblocks/shared';

import { fetchLesson, submitAttempt } from '@/api/lessons';
import { BlockPalette } from '@/components/BlockPalette';
import { BlockWorkspace } from '@/components/BlockWorkspace';
import { StageCanvas } from '@/components/StageCanvas';
import { ZoomPanel } from '@/components/ZoomPanel';
import { useBlockRunner } from '@/hooks/use-block-runner';

const GOALS = [
  '오른쪽 블록 스페이스에서 블록을 눌러 순서대로 쌓습니다.',
  '벽을 피해 캐릭터를 ★ 칸까지 옮기면 성공입니다.',
  '같은 움직임이 반복되면 ‘반복 시작 ~ 반복 끝’으로 묶어 봅니다.',
];

export function LessonPlayerPage() {
  // 라우트 객체를 import 하면 router.tsx 와 순환이 생긴다. 라우트 ID 로 읽는다.
  const { slug } = useParams({ from: '/app/learn/$slug' });

  const { data: lesson } = useQuery({
    queryKey: ['lesson', slug],
    queryFn: () => fetchLesson(slug),
    initialData: () => {
      // noUncheckedIndexedAccess 때문에 LESSON_SEED[0] 도 undefined 가 될 수 있다.
      // 시드는 빌드 시점에 고정이라 실제로는 비지 않지만, 단언 대신 좁혀서 쓴다.
      const seeded = LESSON_SEED.find((l) => l.slug === slug) ?? LESSON_SEED[0];
      if (!seeded) throw new Error('LESSON_SEED 가 비어 있습니다.');
      return seeded;
    },
  });

  /** 스테이지가 없는 미션(토론·언플러그드)은 기본 스테이지로 대체한다. */
  const stage = lesson.stage ?? DEFAULT_STAGE;

  // key 로 슬러그를 걸어 두면 미션이 바뀔 때 상태가 통째로 초기화된다.
  return <Player key={slug} lesson={lesson} stage={stage} />;
}

function Player({
  lesson,
  stage,
}: {
  lesson: (typeof LESSON_SEED)[number];
  stage: NonNullable<(typeof LESSON_SEED)[number]['stage']>;
}) {
  const [program, setProgram] = useState<BlockProgram>([]);
  const runner = useBlockRunner(stage);

  function add(block: ProgramBlock) {
    setProgram((prev) => [...prev, block]);
    runner.reset('블록을 추가했어요. 실행해 볼까요?');
  }

  function remove(index: number) {
    setProgram((prev) => prev.filter((_, i) => i !== index));
    runner.reset();
  }

  function setCount(index: number, count: number) {
    setProgram((prev) => prev.map((b, i) => (i === index ? { ...b, count } : b)));
    runner.reset();
  }

  async function onRun() {
    runner.run(program);
    // 채점 근거는 서버가 다시 계산한다. 실패해도 학습 흐름은 막지 않는다.
    try {
      await submitAttempt(lesson.id, program);
    } catch {
      /* API 연결 전이면 무시 */
    }
  }

  const statusClass =
    runner.status === 'success'
      ? 'text-ok'
      : runner.status === 'failed'
        ? 'text-bad'
        : 'text-muted';

  const standardText = lesson.standardCode
    ? (STANDARD_TEXT[lesson.standardCode] ?? '성취기준 원문이 등록되지 않았습니다.')
    : '교육과정 성취기준에 대응하지 않는 사전 활동입니다.';

  return (
    <div>
      <div className='mb-4 flex flex-wrap items-center gap-3.5'>
        <Link
          to='/app/curriculum'
          className='text-[13.5px] text-muted underline underline-offset-4'
        >
          ← 미션 목록
        </Link>
        <h2 className='text-[25px]'>{lesson.title}</h2>
        <span className='mono rounded-md border border-line-strong px-1.5 py-0.5 text-ink-soft'>
          {lesson.standardCode ?? '교과 외 준비'}
        </span>
      </div>

      <div className='grid items-start gap-4 lg:grid-cols-2'>
        <div className='flex flex-col gap-4'>
          <ZoomPanel title='스테이지'>
            <StageCanvas stage={stage} pose={runner.pose} />
            <p
              className={`mt-3 min-h-[1.5em] text-center text-[13.5px] font-semibold ${statusClass}`}
            >
              {runner.message}
            </p>
            <div className='mt-3 flex flex-wrap justify-center gap-2'>
              <button type='button' className='btn btn-primary' onClick={onRun}>
                ▶ 실행하기
              </button>
              <button type='button' className='btn btn-ghost' onClick={() => runner.reset()}>
                처음으로
              </button>
            </div>
          </ZoomPanel>

          <ZoomPanel title='문제 설명'>
            <p className='text-[14.5px] text-ink-soft'>{lesson.description}</p>
            <ul className='mt-2.5 list-disc pl-5 text-sm text-ink-soft'>
              {GOALS.map((g) => (
                <li key={g} className='mb-1'>
                  {g}
                </li>
              ))}
            </ul>
            <div className='mt-3.5 border-l-[3px] border-line-strong py-0.5 pl-3 text-[13.5px] text-ink-soft'>
              <b className='mono block font-medium text-muted'>
                {lesson.standardCode ? `성취기준 ${lesson.standardCode}` : '교과 외 준비 단계'}
              </b>
              {standardText}
            </div>
          </ZoomPanel>
        </div>

        <ZoomPanel title='블록 코딩 스페이스'>
          <BlockPalette onAdd={add} />
          <BlockWorkspace
            program={program}
            activeIndex={runner.activeIndex}
            onRemove={remove}
            onSetCount={setCount}
          />
          <div className='mt-3.5 flex flex-wrap gap-2'>
            <button
              type='button'
              className='btn btn-ghost'
              onClick={() => {
                setProgram([]);
                runner.reset();
              }}
            >
              블록 모두 지우기
            </button>
          </div>
        </ZoomPanel>
      </div>
    </div>
  );
}
