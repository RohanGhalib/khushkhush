import { create } from 'zustand';
import { User as SupabaseUser } from '@supabase/supabase-js';

export type User = SupabaseUser | any;

interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setIsAdmin: (isAdmin: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAdmin: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
}));
