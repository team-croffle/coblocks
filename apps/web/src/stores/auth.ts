import { create } from 'zustand';

import type { AuthUser } from '@coblocks/shared';

import {
  login as loginRequest,
  logout as logoutRequest,
  me,
  signup as signupRequest,
} from '@/api/auth';
import { isUnauthorized } from '@/api/client';

const TOKEN_KEY = 'coblocks.token';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  /** 새로고침 직후 me() 응답을 기다리는 동안 라우터가 로그인으로 튕기지 않게 하는 플래그 */
  restoring: boolean;
  restore: () => Promise<void>;
  /** XP 처럼 서버에서 바뀐 값을 다시 읽어 온다. */
  refresh: () => Promise<void>;
  login: (nickname: string, password: string) => Promise<AuthUser>;
  /** 가입 응답의 복구 코드는 이때 한 번만 볼 수 있다. 저장하지 않고 화면에 넘긴다. */
  signup: (
    nickname: string,
    password: string,
  ) => Promise<{ user: AuthUser; recoveryCodes: string[] }>;
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
    } catch (error) {
      // 토큰이 거절당한 것이 확인됐을 때만 지운다.
      // API 가 안 떠 있어서 실패한 것까지 로그아웃으로 처리하면, 서버를 껐다 켤 때마다
      // 멀쩡한 세션이 사라진다.
      if (isUnauthorized(error)) {
        localStorage.removeItem(TOKEN_KEY);
        set({ user: null, token: null });
      }
    } finally {
      set({ restoring: false });
    }
  },

  async refresh() {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    try {
      set({ user: await me() });
    } catch {
      // 실패해도 화면을 막지 않는다. 다음 요청이 401 이면 인터셉터가 정리한다.
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

let restorePromise: Promise<void> | null = null;

/**
 * 세션 복원이 끝날 때까지 기다린다. 여러 번 불러도 복원은 한 번만 돈다.
 *
 * 라우터 가드가 이걸 기다리지 않으면, 새로고침 직후에는 아직 `user` 가 null 이라
 * 로그인된 사용자도 `/login` 으로 튕긴다. `restoring` 플래그만 두고 아무도 읽지 않으면
 * 없는 것과 같다.
 */
export const authReady = (): Promise<void> => {
  restorePromise ??= useAuthStore.getState().restore();
  return restorePromise;
};

export const selectIsAdmin = (s: AuthState) => s.user?.role === 'admin';
