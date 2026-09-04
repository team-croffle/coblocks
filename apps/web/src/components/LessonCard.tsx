import { CONCEPTS, GRADE_BANDS, LEVELS, type LessonSummary } from '@coblocks/shared';

interface Props {
  lesson: LessonSummary;
  done?: boolean;
  onOpen: () => void;
}

export function LessonCard({ lesson, done, onOpen }: Props) {
  return (
    <button
      type="button"
      className="card flex w-full flex-col gap-2.5 text-left transition-transform hover:-translate-y-px"
      onClick={onOpen}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-md px-2.5 py-0.5 text-xs font-semibold text-white"
          style={{ background: `var(${CONCEPTS[lesson.concept].cssVar})` }}
        >
          {CONCEPTS[lesson.concept].label}
        </span>
        <span className="mono rounded-md border border-line-strong px-1.5 py-0.5 text-ink-soft">
          {GRADE_BANDS[lesson.band].label}
        </span>
        <span className="mono ml-auto text-muted">{LEVELS[lesson.level]}</span>
      </div>

      <h3 className="text-[17.5px]">{lesson.title}</h3>
      <p className="flex-1 text-sm text-ink-soft">{lesson.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {lesson.blockLabels.map((b) => (
          <code key={b} className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[11.5px] text-ink-soft">
            {b}
          </code>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2.5 border-t border-dashed border-line pt-2.5 text-xs text-muted">
        <span className="flex items-center gap-2">
          <span className="mono">{lesson.standardCode ?? '교과 외 준비'}</span>
          {done && <span className="font-semibold text-ok">✓ 완료</span>}
        </span>
        <span>{lesson.periods}차시</span>
      </div>
    </button>
  );
}
