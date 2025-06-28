import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, type User } from '@repo/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { 
    email: string; 
    password: string; 
    confirm_password: string;
    first_name: string; 
    last_name: string; 
  }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await authService.login({ email, password });
          set({ 
            user: response.user, 
            isAuthenticated: true 
          });
        } catch (error) {
          throw error;
        }
      },

      register: async (userData) => {
        try {
          const response = await authService.register(userData);
          set({ 
            user: response.user, 
            isAuthenticated: true 
          });
        } catch (error) {
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false 
          });
        }
      },

      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user 
        });
      },

      initialize: () => {
        const currentUser = authService.getCurrentUser();
        const isAuth = authService.isAuthenticated();
        set({ 
          user: currentUser, 
          isAuthenticated: isAuth 
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
