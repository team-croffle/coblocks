import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import { lazy, Suspense, useState } from 'react';

import { STANDARD_TEXT } from '@coblocks/shared';
import type { AttemptResult, BlockProgram, Lesson, StageConfig } from '@coblocks/shared';

import { submitAttempt } from '@/api/lessons';
import { lessonQuery, myProgressQuery } from '@/api/queries';
import { LoadState } from '@/components/LoadState';
import { StageCanvas } from '@/components/StageCanvas';
import { ZoomPanel } from '@/components/ZoomPanel';
import { useBlockRunner } from '@/hooks/use-block-runner';
import { useAuthStore } from '@/stores/auth';
import { toast } from '@/stores/toast';

/** Blockly 는 번들이 크다. 플레이어에 들어올 때만 내려받는다. */
const BlocklyEditor = lazy(async () => ({
  default: (await import('@/components/BlocklyEditor')).BlocklyEditor,
}));

const GOALS = [
  '오른쪽 블록 스페이스에서 블록을 눌러 순서대로 쌓습니다.',
  '벽을 피해 캐릭터를 ★ 칸까지 옮기면 성공입니다.',
  '같은 움직임이 반복되면 ‘반복 시작 ~ 반복 끝’으로 묶어 봅니다.',
];

export function LessonPlayerPage() {
  // 라우트 객체를 import 하면 router.tsx 와 순환이 생긴다. 라우트 ID 로 읽는다.
  const { slug } = useParams({ from: '/app/learn/$slug' });

  const lesson = useQuery(lessonQuery(slug));

  if (!lesson.isSuccess) {
    return (
      <LoadState
        pending={lesson.isPending}
        error={lesson.isError}
        onRetry={() => void lesson.refetch()}
        label='미션'
      />
    );
  }

  // key 로 슬러그를 걸어 두면 미션이 바뀔 때 상태가 통째로 초기화된다.
  //
  // **스테이지가 없는 미션에 기본 스테이지를 끼워 넣지 않는다.** 예전에는
  // `lesson.stage ?? DEFAULT_STAGE` 로 미로를 그렸는데, 그러면 토론·언플러그드 미션
  // 열일곱 개가 전부 같은 미로로 보였고, 화면은 "성공"이라 하는데 서버는 스테이지가 없어
  // 실패로 채점해 XP 가 오르지 않았다. 데이터가 "나는 미로가 아니다"라고 말할 때는
  // 그대로 말해야 한다.
  const { stage } = lesson.data;
  return stage ? (
    <StagePlayer key={slug} lesson={lesson.data} stage={stage} />
  ) : (
    <ActivityLesson key={slug} lesson={lesson.data} />
  );
}

/** 미션 머리말 — 제목과 성취기준. 두 화면이 같이 쓴다. */
function LessonHeader({ lesson }: { lesson: Lesson }) {
  return (
    <div className='mb-4 flex flex-wrap items-center gap-3.5'>
      <Link to='/app/curriculum' className='text-[13.5px] text-muted underline underline-offset-4'>
        ← 미션 목록
      </Link>
      <h2 className='text-[25px]'>{lesson.title}</h2>
      <span className='mono rounded-md border border-line-strong px-1.5 py-0.5 text-ink-soft'>
        {lesson.standardCode ?? '교과 외 준비'}
      </span>
    </div>
  );
}

function standardTextOf(lesson: Lesson): string {
  if (!lesson.standardCode) return '교육과정 성취기준에 대응하지 않는 사전 활동입니다.';
  return STANDARD_TEXT[lesson.standardCode] ?? '성취기준 원문이 등록되지 않았습니다.';
}

/**
 * 스테이지가 없는 미션. 카드 정렬, 토론, 언플러그드 활동 같은 것들이다.
 * 블록 퍼즐이 아니므로 실행 버튼도 없고, 서버도 이런 미션은 채점하지 않는다.
 */
function ActivityLesson({ lesson }: { lesson: Lesson }) {
  return (
    <div>
      <LessonHeader lesson={lesson} />

      <div className='grid items-start gap-4 lg:grid-cols-[1.1fr_.9fr]'>
        <ZoomPanel title='활동 안내'>
          <p className='text-[14.5px] text-ink-soft'>{lesson.description}</p>
          {lesson.blockLabels.length > 0 && (
            <div className='mt-3.5'>
              <div className='mb-1.5 text-[12.5px] text-muted'>다루는 개념</div>
              <div className='flex flex-wrap gap-1.5'>
                {lesson.blockLabels.map((label) => (
                  <code
                    key={label}
                    className='rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[11.5px] text-ink-soft'
                  >
                    {label}
                  </code>
                ))}
              </div>
            </div>
          )}
          <div className='mt-3.5 border-l-[3px] border-line-strong py-0.5 pl-3 text-[13.5px] text-ink-soft'>
            <b className='mono block font-medium text-muted'>
              {lesson.standardCode ? `성취기준 ${lesson.standardCode}` : '교과 외 준비 단계'}
            </b>
            {standardTextOf(lesson)}
          </div>
        </ZoomPanel>

        <ZoomPanel title='블록 스테이지가 없는 미션입니다'>
          <p className='text-[14.5px] text-ink-soft'>
            이 미션은 화면에서 블록으로 푸는 문제가 아니라, 교실에서 카드·몸·말로 하는 활동입니다.
            그래서 실행 버튼도 채점도 없습니다.
          </p>
          <p className='mt-3 text-[13.5px] text-muted'>
            활동을 마쳤다는 기록은 아직 남길 수 없습니다. 교사가 완료를 표시하는 기능이 붙으면 그때
            XP 도 함께 붙습니다.
          </p>
          <div className='mt-4'>
            <Link to='/app/curriculum' className='btn btn-ghost'>
              다른 미션 보기
            </Link>
          </div>
        </ZoomPanel>
      </div>
    </div>
  );
}

function StagePlayer({ lesson, stage }: { lesson: Lesson; stage: StageConfig }) {
  const [program, setProgram] = useState<BlockProgram>([]);
  const [workspace, setWorkspace] = useState<unknown>(null);
  /** 서버가 돌려준 마지막 채점 결과. 화면의 실행은 미리보기이고, 이것이 정본이다. */
  const [graded, setGraded] = useState<AttemptResult | null>(null);
  const refreshUser = useAuthStore((s) => s.refresh);
  const runner = useBlockRunner(stage);

  // 마지막으로 저장한 워크스페이스를 가져와 에디터를 그 상태로 연다.
  const { data: saved, isPending: savedPending } = useQuery(myProgressQuery());
  const savedWorkspace = saved?.find((p) => p.lessonId === lesson.id)?.workspace ?? null;

  function onEditorChange(next: BlockProgram, nextWorkspace: unknown) {
    setProgram(next);
    setWorkspace(nextWorkspace);
  }

  async function onRun() {
    setGraded(null);
    runner.run(program);
    // 채점 근거는 서버가 다시 계산한다. 화면의 실행 결과는 미리보기일 뿐이다.
    try {
      const result = await submitAttempt(lesson.id, program, workspace);
      setGraded(result);
      // 이미 완료한 미션은 XP 가 0 이라 헤더를 다시 읽을 필요가 없다.
      if (result.awardedXp > 0) await refreshUser();
    } catch {
      // 조용히 삼키면 학생은 저장된 줄 안다. 실패는 실패라고 말한다.
      toast.error('기록을 서버에 저장하지 못했습니다. 화면의 결과는 미리보기입니다.');
    }
  }

  const statusClass =
    runner.status === 'success'
      ? 'text-ok'
      : runner.status === 'failed'
        ? 'text-bad'
        : 'text-muted';

  return (
    <div>
      <LessonHeader lesson={lesson} />

      <div className='grid items-start gap-4 lg:grid-cols-2'>
        <div className='flex flex-col gap-4'>
          <ZoomPanel title='스테이지'>
            <StageCanvas stage={stage} pose={runner.pose} />
            <p
              className={`mt-3 min-h-[1.5em] text-center text-[13.5px] font-semibold ${statusClass}`}
            >
              {runner.message}
              {/*
                XP 안내는 **서버가 준 결과**로만 말한다. 예전에는 화면의 실행 상태를 보고
                "이미 완료한 미션"이라고 단정했는데, 서버가 다른 이유로 0 을 줬을 때도
                같은 문장이 나와서 틀린 말을 하고 있었다.
              */}
              {graded?.outcome === 'success' && graded.awardedXp > 0 && (
                <span className='ml-2 text-ok'>+{graded.awardedXp} XP</span>
              )}
              {graded?.outcome === 'success' && graded.awardedXp === 0 && (
                <span className='ml-2 text-muted'>이미 완료한 미션이라 XP 는 오르지 않아요</span>
              )}
              {graded && graded.outcome !== 'success' && runner.status === 'success' && (
                <span className='ml-2 text-bad'>
                  서버 채점은 실패로 나왔어요 — 완료로 기록되지 않았습니다
                </span>
              )}
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
              {standardTextOf(lesson)}
            </div>
          </ZoomPanel>
        </div>

        <ZoomPanel title='블록 코딩 스페이스'>
          {savedPending ? (
            <div className='grid h-[420px] place-items-center text-[13.5px] text-muted'>
              불러오는 중…
            </div>
          ) : (
            <Suspense
              fallback={
                <div className='grid h-[420px] place-items-center text-[13.5px] text-muted'>
                  블록 편집기를 준비하고 있어요…
                </div>
              }
            >
              <BlocklyEditor
                initialWorkspace={savedWorkspace}
                onChange={onEditorChange}
                activeBlockId={runner.activeBlockId}
              />
            </Suspense>
          )}
          <p className='mt-3 text-[12.5px] text-muted'>
            블록 {program.length}개 · 왼쪽 서랍에서 블록을 끌어다 이어 붙입니다.
          </p>
        </ZoomPanel>
      </div>
    </div>
  );
}
