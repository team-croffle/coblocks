import { create } from 'zustand';
import type { AuthUser } from '@coblocks/shared';
import { login as loginRequest, logout as logoutRequest, me } from '@/api/auth';

const TOKEN_KEY = 'coblocks.token';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  /** 새로고침 직후 me() 응답을 기다리는 동안 라우터가 로그인으로 튕기지 않게 하는 플래그 */
  restoring: boolean;
  restore: () => Promise<void>;
  login: (loginId: string, password: string) => Promise<AuthUser>;
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

  async login(loginId, password) {
    set({ loading: true });
    try {
      const res = await loginRequest({ loginId, password });
      localStorage.setItem(TOKEN_KEY, res.accessToken);
      set({ user: res.user, token: res.accessToken });
      return res.user;
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
