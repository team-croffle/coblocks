import { supabase } from '@/utils/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface UserState {
  session: Session | null;
  user: User | null;
  isLoggedIn: boolean;
}

interface UserActions {
  login: (session: Session | null, user: User | null) => void;
  logout: () => void;
}

export const useUserStore = create(
  immer<UserState & UserActions>((set) => {
    return {
      session: null,
      user: null,
      isLoggedIn: false,

      login: async (session, user) => {
        set((state) => {
          state.session = session;
          state.user = user;
          state.isLoggedIn = !!session;
        });
      },

      logout: async () => {
        await supabase.auth.signOut();
        set((state) => {
          state.session = null;
          state.user = null;
          state.isLoggedIn = false;
        });
      },
    };
  }),
);
