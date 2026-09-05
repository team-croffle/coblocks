import { create } from 'zustand';

export type ToastTone = 'info' | 'error';

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: Toast[];
  show: (message: string, tone?: ToastTone) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

/**
 * 화면 한 곳에서만 뜨는 알림.
 * 페이지마다 `notice` 문자열을 두면 같은 안내가 자리마다 다르게 생기고,
 * 실패를 조용히 삼키는 자리가 생긴다.
 */
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show(message, tone = 'info') {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
    window.setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  dismiss(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

export const toast = {
  info: (message: string) => useToastStore.getState().show(message, 'info'),
  error: (message: string) => useToastStore.getState().show(message, 'error'),
};
