import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth.service';
import type { Database } from '../types/database.types';

type AdminUser = Database['public']['Tables']['admin_users']['Row'];
type AdminRole = 'super_admin' | 'content_manager' | 'moderator';

interface AuthState {
  user: AdminUser | null;
  role: AdminRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const { user, error } = await authService.login({ email, password });

          if (error) {
            set({ error: error.message, isLoading: false });
            return false;
          }

          if (user) {
            set({
              user,
              role: user.role as AdminRole,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          }

          set({ error: 'Login failed', isLoading: false });
          return false;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'An error occurred',
            isLoading: false,
          });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          await authService.logout();
          set({
            user: null,
            role: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Logout failed',
            isLoading: false,
          });
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });

        try {
          const { user, error } = await authService.getCurrentAdminUser();

          if (error || !user) {
            set({
              user: null,
              role: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          set({
            user,
            role: user.role as AdminRole,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          set({
            user: null,
            role: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
