import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface ThemeState {
  isAppThemeDark: boolean;
  toggleAppTheme: () => void;
}

export const useThemeStore = create(
  immer<ThemeState>((set) => {
    let localTheme: string | null = localStorage.getItem('theme');
    if (!localTheme) {
      localTheme = 'light';
    }

    document.documentElement.classList.toggle('dark', localTheme === 'dark');

    return {
      isAppThemeDark: localTheme === 'dark',

      toggleAppTheme: () => {
        set((state) => {
          state.isAppThemeDark = !state.isAppThemeDark;
          localStorage.setItem('theme', state.isAppThemeDark ? 'dark' : 'light');
          document.documentElement.classList.toggle('dark', state.isAppThemeDark);
        });
      },
    };
  }),
);
