import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import {
  accountLevel,
  CONCEPT_ORDER,
  CONCEPTS,
  XP_PER_ACCOUNT_LEVEL,
  xpIntoLevel,
} from '@coblocks/shared';

import { lessonsQuery, myProgressQuery } from '@/api/queries';
import { LoadState } from '@/components/LoadState';
import { useAuthStore } from '@/stores/auth';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const lessons = useQuery(lessonsQuery());
  const progressQuery = useQuery(myProgressQuery());

  const items = lessons.data?.items ?? [];
  const progress = progressQuery.data ?? [];

  const pending = lessons.isPending || progressQuery.isPending;
  const failed = lessons.isError || progressQuery.isError;

  const completedIds = new Set(
    progress.filter((p) => p.state === 'completed').map((p) => p.lessonId),
  );

  /** 개념별 완료 비율 — 색은 개념 색을 그대로 쓴다. */
  const byConcept = CONCEPT_ORDER.map((key) => {
    const conceptLessons = items.filter((l) => l.concept === key);
    return {
      key,
      label: CONCEPTS[key].label,
      cssVar: CONCEPTS[key].cssVar,
      done: conceptLessons.filter((l) => completedIds.has(l.id)).length,
      total: conceptLessons.length,
    };
  }).filter((row) => row.total > 0);

  /** 이어서 학습할 미션: 진행 중이 있으면 그것, 없으면 첫 미완료 미션. */
  const inProgress = progress.find((p) => p.state === 'in_progress');
  const resume =
    (inProgress ? items.find((l) => l.id === inProgress.lessonId) : undefined) ??
    items.find((l) => !completedIds.has(l.id)) ??
    items[0];

  return (
    <div>
      <div className='mb-6 flex flex-wrap items-end justify-between gap-5'>
        <div>
          <h2 className='text-[28px]'>{user?.nickname}님, 이어서 해볼까요?</h2>
          <p className='text-[14.5px] text-muted'>
            완료한 미션 {completedIds.size}개 / 전체 {items.length}개
          </p>
          <div className='mt-2 flex items-center gap-2.5'>
            <span className='rounded-full bg-seq px-2.5 py-0.5 text-xs font-semibold text-white'>
              Lv.{accountLevel(user?.xp ?? 0)}
            </span>
            <span className='text-[13px] text-muted'>
              {user?.xp ?? 0} XP · 다음 레벨까지 {XP_PER_ACCOUNT_LEVEL - xpIntoLevel(user?.xp ?? 0)}{' '}
              XP
            </span>
          </div>
        </div>
        <div className='flex flex-wrap gap-3'>
          {user?.role === 'admin' && (
            <Link to='/admin/overview' className='btn btn-ghost'>
              ⚙ 관리자 페이지
            </Link>
          )}
          <Link to='/app/curriculum' className='btn btn-primary'>
            학습하기로 이동
          </Link>
        </div>
      </div>

      <LoadState
        pending={pending}
        error={failed}
        onRetry={() => {
          void lessons.refetch();
          void progressQuery.refetch();
        }}
        label='학습 현황'
      />

      {!pending && !failed && (
        <>
          <div className='mb-6 grid gap-4 md:grid-cols-3'>
            <div className='card'>
              <div className='text-[12.5px] text-muted'>완료한 미션</div>
              <div className='font-display text-[34px] leading-tight tabular-nums'>
                {completedIds.size}
                <small className='ml-1 font-sans text-sm text-muted'>/ {items.length}</small>
              </div>
            </div>
            <div className='card'>
              <div className='text-[12.5px] text-muted'>진행 중</div>
              <div className='font-display text-[34px] leading-tight tabular-nums'>
                {progress.filter((p) => p.state === 'in_progress').length}
              </div>
            </div>
            <div className='card'>
              <div className='text-[12.5px] text-muted'>누적 시도</div>
              <div className='font-display text-[34px] leading-tight tabular-nums'>
                {progress.reduce((sum, p) => sum + p.attempts, 0)}
              </div>
            </div>
          </div>

          <div className='grid gap-5 lg:grid-cols-[1.25fr_.75fr]'>
            <div className='panel p-5'>
              <h3 className='text-[18px]'>이어서 학습하기</h3>
              <p className='mb-4 text-[13px] text-muted'>가장 먼저 손대야 할 미션입니다.</p>

              {resume ? (
                <div
                  className='flex flex-col gap-2.5 rounded-xl border border-line bg-surface p-4'
                  style={{ borderLeft: `5px solid var(${CONCEPTS[resume.concept].cssVar})` }}
                >
                  <div className='font-display text-xl'>{resume.title}</div>
                  <p className='text-sm text-ink-soft'>{resume.description}</p>
                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <span className='mono text-muted'>
                      {resume.standardCode ?? '교과 외 준비'} · {resume.periods}차시
                    </span>
                    <Link
                      to='/app/learn/$slug'
                      params={{ slug: resume.slug }}
                      className='btn btn-primary'
                    >
                      이어서 하기
                    </Link>
                  </div>
                </div>
              ) : (
                <p className='text-sm text-muted'>공개된 미션이 아직 없습니다.</p>
              )}

              <h3 className='mt-6 text-[18px]'>개념별 진행률</h3>
              <p className='mb-4 text-[13px] text-muted'>완료한 미션을 개념별로 나눈 비율입니다.</p>
              <div className='flex flex-col gap-3'>
                {byConcept.map((row) => (
                  <div
                    key={row.key}
                    className='grid grid-cols-[88px_1fr_56px] items-center gap-2.5 text-[13.5px]'
                  >
                    <span className='text-ink-soft'>{row.label}</span>
                    <div className='h-2.5 overflow-hidden rounded-full bg-surface-2'>
                      <div
                        className='h-full rounded-full'
                        style={{
                          width: `${Math.round((row.done / row.total) * 100)}%`,
                          background: `var(${row.cssVar})`,
                        }}
                      />
                    </div>
                    <span className='mono text-right text-muted'>
                      {row.done}/{row.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className='panel p-5'>
              <h3 className='text-[18px]'>최근 활동</h3>
              {/* TODO: /progress/me/activity 엔드포인트가 생기면 시각·행위까지 보여 준다 */}
              <p className='mb-4 text-[13px] text-muted'>최근에 손댄 미션 순서입니다.</p>
              {progress.slice(0, 6).map((p) => (
                <div
                  key={p.lessonId}
                  className='flex items-start gap-3 border-b border-dashed border-line py-2.5 text-sm last:border-0'
                >
                  <span>{items.find((l) => l.id === p.lessonId)?.title ?? p.lessonId}</span>
                  <span className='mono ml-auto whitespace-nowrap text-muted'>{p.state}</span>
                </div>
              ))}
              {progress.length === 0 && (
                <p className='text-sm text-muted'>아직 풀어 본 미션이 없습니다.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
