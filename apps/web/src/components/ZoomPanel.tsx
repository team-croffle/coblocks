import { useEffect, useState, type ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

/** 패널 하나를 화면 전체로 키웠다 줄인다. Esc 로도 닫힌다. */
export function ZoomPanel({ title, children }: Props) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [expanded]);

  return (
    <section
      className={`panel flex min-w-0 flex-col ${expanded ? 'fixed inset-0 z-[80] overflow-auto rounded-none bg-paper' : ''}`}
    >
      <div className="flex items-center gap-2.5 border-b border-line px-3.5 py-2.5">
        <span className="font-display text-[16px]">{title}</span>
        <span className="flex-1" />
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-2.5 py-1 text-[12.5px] text-ink-soft"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          <span aria-hidden="true">{expanded ? '⤡' : '⤢'}</span>
          {expanded ? '작게 보기' : '크게 보기'}
        </button>
      </div>

      <div className={`min-w-0 ${expanded ? 'mx-auto w-full max-w-[1000px] p-5' : 'p-3.5'}`}>{children}</div>
    </section>
  );
}
