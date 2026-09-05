import { CONCEPTS, GRADE_BANDS, LEVELS, STANDARD_TEXT } from '@coblocks/shared';
import type { LessonSummary } from '@coblocks/shared';

interface Props {
  lesson: LessonSummary;
  onClose: () => void;
  onStart: () => void;
}

export function LessonDetailModal({ lesson, onClose, onStart }: Props) {
  const standardText = lesson.standardCode
    ? (STANDARD_TEXT[lesson.standardCode] ?? '성취기준 원문이 등록되지 않았습니다.')
    : '교육과정 성취기준에 대응하지 않는 사전 활동입니다.';

  return (
    // 바깥 영역은 배경일 뿐이다. 대화상자 의미는 안쪽 상자가 갖는다.
    <div
      className='fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-6'
      role='presentation'
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className='max-h-[86vh] w-full max-w-[560px] overflow-auto rounded-[18px] border border-line bg-paper'
        role='dialog'
        aria-modal='true'
        aria-labelledby='lesson-detail-title'
      >
        <div className='flex flex-col gap-2.5 px-6 pt-5'>
          <div className='flex flex-wrap items-center gap-2'>
            <span
              className='rounded-md px-2.5 py-0.5 text-xs font-semibold text-white'
              style={{ background: `var(${CONCEPTS[lesson.concept].cssVar})` }}
            >
              {CONCEPTS[lesson.concept].label}
            </span>
            <span className='mono rounded-md border border-line-strong px-1.5 py-0.5'>
              {GRADE_BANDS[lesson.band].label} · {GRADE_BANDS[lesson.band].subject}
            </span>
          </div>
          <h3 id='lesson-detail-title' className='text-[23px]'>
            {lesson.title}
          </h3>
        </div>

        <div className='flex flex-col gap-4 px-6 pt-4'>
          <p className='text-[14.5px] text-ink-soft'>{lesson.description}</p>

          <dl className='grid grid-cols-[78px_1fr] gap-x-3.5 gap-y-1.5 text-[13.5px]'>
            <dt className='text-muted'>난이도</dt>
            <dd className='text-ink-soft'>{LEVELS[lesson.level]}</dd>
            <dt className='text-muted'>분량</dt>
            <dd className='text-ink-soft'>{lesson.periods}차시</dd>
            <dt className='text-muted'>사용 블록</dt>
            <dd className='text-ink-soft'>{lesson.blockLabels.join(', ')}</dd>
          </dl>

          <div className='border-l-[3px] border-line-strong py-0.5 pl-3 text-[13.5px] text-ink-soft'>
            <b className='mono block font-medium text-muted'>
              {lesson.standardCode ? `성취기준 ${lesson.standardCode}` : '교과 외 준비 단계'}
            </b>
            {standardText}
          </div>
        </div>

        <div className='sticky bottom-0 flex justify-end gap-2.5 bg-paper px-6 py-5'>
          <button type='button' className='btn btn-ghost' onClick={onClose}>
            닫기
          </button>
          <button type='button' className='btn btn-primary' onClick={onStart}>
            학습하기
          </button>
        </div>
      </div>
    </div>
  );
}
