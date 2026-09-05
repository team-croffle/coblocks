import { create } from 'zustand';

import type { AuthUser } from '@coblocks/shared';
import { login as loginRequest, logout as logoutRequest, me, signup as signupRequest } from '@/api/auth';

const TOKEN_KEY = 'coblocks.token';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  /** 새로고침 직후 me() 응답을 기다리는 동안 라우터가 로그인으로 튕기지 않게 하는 플래그 */
  restoring: boolean;
  restore: () => Promise<void>;
  login: (nickname: string, password: string) => Promise<AuthUser>;
  /** 가입 응답의 복구 코드는 이때 한 번만 볼 수 있다. 저장하지 않고 화면에 넘긴다. */
  signup: (nickname: string, password: string) => Promise<{ user: AuthUser; recoveryCodes: string[] }>;
  logout: () => Promise<void>;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  loading: false,
  restoring: !!localStorage.getItem(TOKEN_KEY),

  async restore() {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (!saved) return set({ restoring: false });
    try {
      set({ user: await me(), token: saved });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null });
    } finally {
      set({ restoring: false });
    }
  },

  async login(nickname, password) {
    set({ loading: true });
    try {
      const res = await loginRequest({ nickname, password });
      localStorage.setItem(TOKEN_KEY, res.accessToken);
      set({ user: res.user, token: res.accessToken });
      return res.user;
    } finally {
      set({ loading: false });
    }
  },

  async signup(nickname, password) {
    set({ loading: true });
    try {
      const res = await signupRequest({ nickname, password });
      localStorage.setItem(TOKEN_KEY, res.accessToken);
      set({ user: res.user, token: res.accessToken });
      return { user: res.user, recoveryCodes: res.recoveryCodes };
    } finally {
      set({ loading: false });
    }
  },

  async logout() {
    try {
      await logoutRequest();
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null });
    }
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null });
  },
}));

export const selectIsAdmin = (s: AuthState) => s.user?.role === 'admin';
