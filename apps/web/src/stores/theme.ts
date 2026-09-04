import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';
const KEY = 'coblocks.theme';

function readStored(): Theme {
  const saved = localStorage.getItem(KEY);
  return saved === 'light' || saved === 'dark' ? saved : 'system';
}

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
}

/** system 상태에서는 OS 설정을 그대로 따른다. 실제 밝기를 알아야 토글 라벨을 정할 수 있다. */
function resolveDark(theme: Theme): boolean {
  if (theme !== 'system') return theme === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

interface ThemeState {
  theme: Theme;
  dark: boolean;
  toggle: () => void;
}

const initial = readStored();
apply(initial);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initial,
  dark: resolveDark(initial),
  toggle() {
    const next: Theme = get().dark ? 'light' : 'dark';
    localStorage.setItem(KEY, next);
    apply(next);
    set({ theme: next, dark: next === 'dark' });
  },
}));
