import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { CONCEPT_ORDER, CONCEPTS, GRADE_BANDS, LEVELS } from '@coblocks/shared';
import type { ConceptKey, GradeBand, LessonLevel, LessonSummary } from '@coblocks/shared';

import { lessonsQuery, myProgressQuery } from '@/api/queries';
import { LessonCard } from '@/components/LessonCard';
import { LessonDetailModal } from '@/components/LessonDetailModal';
import { LoadState } from '@/components/LoadState';

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function CurriculumPage() {
  const navigate = useNavigate();

  const [q, setQ] = useState('');
  const [bands, setBands] = useState<GradeBand[]>([]);
  const [concepts, setConcepts] = useState<ConceptKey[]>([]);
  const [levels, setLevels] = useState<LessonLevel[]>([]);
  const [selected, setSelected] = useState<LessonSummary | null>(null);

  const lessons = useQuery(lessonsQuery());

  // 진행률은 곁들이는 정보다. 못 불러와도 목록은 보여 준다.
  const { data: progress } = useQuery(myProgressQuery());
  const doneIds = new Set(
    (progress ?? []).filter((p) => p.state === 'completed').map((p) => p.lessonId),
  );

  const items = lessons.data?.items ?? [];

  /**
   * 필터는 클라이언트에서 건다. 미션 수가 수백 단위를 넘으면
   * fetchLessons(query) 로 서버 필터링으로 옮긴다.
   */
  const keyword = q.trim().toLowerCase();
  const filtered = items.filter((l) => {
    if (bands.length && !bands.includes(l.band)) return false;
    if (concepts.length && !concepts.includes(l.concept)) return false;
    if (levels.length && !levels.includes(l.level)) return false;
    if (!keyword) return true;
    const haystack = [
      l.title,
      l.description,
      CONCEPTS[l.concept].label,
      GRADE_BANDS[l.band].label,
      l.standardCode ?? '',
      ...l.blockLabels,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(keyword);
  });

  function reset() {
    setQ('');
    setBands([]);
    setConcepts([]);
    setLevels([]);
  }

  return (
    <div>
      <div className='mb-6'>
        <h2 className='text-[28px]'>학습하기</h2>
        <p className='text-[14.5px] text-muted'>
          학년군과 개념으로 좁히거나, 미션 이름·성취기준 코드로 바로 검색해 보세요.
        </p>
      </div>

      <div className='mb-5 flex flex-col gap-3.5'>
        <input
          type='search'
          className='field-input max-w-[520px]'
          placeholder='미션 이름, 개념, 성취기준 코드로 검색 (예: 반복, 9정03)'
          aria-label='커리큘럼 검색'
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className='flex flex-wrap items-baseline gap-3'>
          <span className='mono w-16 tracking-widest text-muted'>학년군</span>
          <div className='flex flex-wrap gap-2'>
            {(Object.keys(GRADE_BANDS) as GradeBand[]).map((key) => (
              <button
                key={key}
                type='button'
                className='chip'
                aria-pressed={bands.includes(key)}
                onClick={() => setBands((prev) => toggle(prev, key))}
              >
                {GRADE_BANDS[key].label}
              </button>
            ))}
          </div>
        </div>

        <div className='flex flex-wrap items-baseline gap-3'>
          <span className='mono w-16 tracking-widest text-muted'>개념</span>
          <div className='flex flex-wrap gap-2'>
            {CONCEPT_ORDER.map((key) => (
              <button
                key={key}
                type='button'
                className='chip'
                aria-pressed={concepts.includes(key)}
                onClick={() => setConcepts((prev) => toggle(prev, key))}
              >
                <span
                  className='h-2.5 w-2.5 rounded'
                  style={{ background: `var(${CONCEPTS[key].cssVar})` }}
                  aria-hidden='true'
                />
                {CONCEPTS[key].label}
              </button>
            ))}
          </div>
        </div>

        <div className='flex flex-wrap items-baseline gap-3'>
          <span className='mono w-16 tracking-widest text-muted'>난이도</span>
          <div className='flex flex-wrap gap-2'>
            {([1, 2, 3] as LessonLevel[]).map((lv) => (
              <button
                key={lv}
                type='button'
                className='chip'
                aria-pressed={levels.includes(lv)}
                onClick={() => setLevels((prev) => toggle(prev, lv))}
              >
                {LEVELS[lv]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className='mb-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3.5'>
        <span className='text-sm text-muted'>
          전체 {items.length}개 미션 중 <b className='text-ink tabular-nums'>{filtered.length}</b>개
        </span>
        <button
          type='button'
          className='text-[13.5px] text-muted underline underline-offset-4'
          onClick={reset}
        >
          필터 초기화
        </button>
      </div>

      <LoadState
        pending={lessons.isPending}
        error={lessons.isError}
        onRetry={() => void lessons.refetch()}
        label='미션 목록'
      />

      {lessons.isSuccess &&
        (filtered.length > 0 ? (
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            {filtered.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                done={doneIds.has(lesson.id)}
                onOpen={() => setSelected(lesson)}
              />
            ))}
          </div>
        ) : (
          <div className='rounded-card border border-dashed border-line-strong p-11 text-center text-muted'>
            <strong className='mb-1.5 block font-display text-[19px] text-ink'>
              {items.length === 0 ? '등록된 미션이 없습니다' : '조건에 맞는 미션이 없습니다'}
            </strong>
            {items.length === 0
              ? '관리자 페이지에서 미션을 등록하면 여기에 나타납니다.'
              : '검색어를 줄이거나 필터를 하나 풀어 보세요.'}
          </div>
        ))}

      {selected && (
        <LessonDetailModal
          lesson={selected}
          onClose={() => setSelected(null)}
          onStart={() => {
            const slug = selected.slug;
            setSelected(null);
            void navigate({ to: '/app/learn/$slug', params: { slug } });
          }}
        />
      )}
    </div>
  );
}
