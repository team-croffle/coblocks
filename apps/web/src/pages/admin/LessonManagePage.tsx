import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { CONCEPTS, GRADE_BANDS, LESSON_SEED } from '@coblocks/shared';
import type { Lesson } from '@coblocks/shared';

import { fetchAdminLessons } from '@/api/admin';

const STATUS = {
  published: { label: '공개', cssVar: '--color-ok' },
  draft: { label: '임시저장', cssVar: '--color-muted' },
  archived: { label: '보관', cssVar: '--color-bad' },
} as const;

export function LessonManagePage() {
  const { data } = useQuery({
    queryKey: ['admin', 'lessons'],
    queryFn: fetchAdminLessons,
    initialData: {
      items: LESSON_SEED as Lesson[],
      total: LESSON_SEED.length,
      page: 1,
      pageSize: 200,
    },
  });

  return (
    <section>
      <div className='mb-5 flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h3 className='text-[21px]'>문제 관리</h3>
          <p className='text-sm text-muted'>등록된 미션의 공개 상태와 내용을 관리합니다.</p>
        </div>
        <Link to='/admin/lessons/new' className='btn btn-primary'>
          + 문제 등록
        </Link>
      </div>

      <div className='overflow-x-auto rounded-card border border-line'>
        <table className='w-full min-w-[720px] text-[13.5px]'>
          <thead>
            <tr className='bg-surface text-muted'>
              <th className='th'>미션</th>
              <th className='th'>학년군</th>
              <th className='th'>개념</th>
              <th className='th'>성취기준</th>
              <th className='th'>차시</th>
              <th className='th'>상태</th>
              <th className='th' aria-label='관리' />
            </tr>
          </thead>
          <tbody>
            {data.items.map((l) => (
              <tr key={l.id} className='border-t border-line'>
                <td className='td whitespace-normal'>{l.title}</td>
                <td className='td'>{GRADE_BANDS[l.band].label}</td>
                <td className='td'>{CONCEPTS[l.concept].label}</td>
                <td className='td mono'>{l.standardCode ?? '—'}</td>
                <td className='td'>{l.periods}차시</td>
                <td className='td'>
                  <span
                    className='rounded-full border px-2.5 py-0.5 text-xs font-semibold'
                    style={{
                      borderColor: `var(${STATUS[l.status].cssVar})`,
                      color: `var(${STATUS[l.status].cssVar})`,
                    }}
                  >
                    {STATUS[l.status].label}
                  </span>
                </td>
                <td className='td'>
                  <Link
                    to='/admin/lessons/$id/edit'
                    params={{ id: l.id }}
                    className='rounded-md bg-surface-2 px-2.5 py-1 text-[12.5px] text-ink-soft'
                  >
                    수정
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
