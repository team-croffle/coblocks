import { useToastStore } from '@/stores/toast';

/** 알림이 실제로 그려지는 자리. 루트에 한 번만 놓는다. */
export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      className='pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-2 px-4'
      role='status'
      aria-live='polite'
    >
      {toasts.map((t) => (
        <button
          key={t.id}
          type='button'
          className='pointer-events-auto max-w-[520px] rounded-[10px] border px-3.5 py-2.5 text-left text-[13.5px] shadow-card'
          style={{
            background: 'var(--color-paper)',
            borderColor: t.tone === 'error' ? 'var(--color-bad)' : 'var(--color-line-strong)',
            color: t.tone === 'error' ? 'var(--color-bad)' : 'var(--color-ink-soft)',
          }}
          onClick={() => dismiss(t.id)}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
