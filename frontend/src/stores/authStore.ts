import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '@/types/user';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  userId: number | null;
  fullName: string | null;
  email: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;

  setAuth: (data: {
    token: string;
    refreshToken: string;
    userId: number;
    fullName: string;
    email: string;
    role: UserRole;
  }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      userId: null,
      fullName: null,
      email: null,
      role: null,
      isAuthenticated: false,

      setAuth: (data) =>
        set({
          token: data.token,
          refreshToken: data.refreshToken,
          userId: data.userId,
          fullName: data.fullName,
          email: data.email,
          role: data.role as UserRole,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          token: null,
          refreshToken: null,
          userId: null,
          fullName: null,
          email: null,
          role: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
