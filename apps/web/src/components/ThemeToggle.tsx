import { useThemeStore } from '@/stores/theme';

export function ThemeToggle() {
  const dark = useThemeStore((s) => s.dark);
  const toggle = useThemeStore((s) => s.toggle);

  return (
    <button
      type='button'
      className='inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3.5 py-1.5 text-[13px] text-ink-soft'
      aria-pressed={dark}
      onClick={toggle}
    >
      <span aria-hidden='true'>{dark ? '☀' : '◑'}</span>
      {dark ? '밝게' : '어둡게'}
    </button>
  );
}
