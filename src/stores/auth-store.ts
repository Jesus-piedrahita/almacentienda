/**
 * @fileoverview Zustand store for authentication state.
 * Manages user, token, and authentication status globally.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { UserResponse } from '@/lib/api';

/**
 * Estado de autenticación
 */
interface AuthState {
  /** Usuario actual */
  user: UserResponse | null;
  /** Token JWT */
  token: string | null;
  /** Indica si el usuario está autenticado */
  isAuthenticated: boolean;
  /** Indica si el estado ha sido inicializado desde localStorage */
  isInitialized: boolean;

  // Actions
  /** Establece el token y usuario */
  setAuth: (token: string, user: UserResponse) => void;
  /** Cierra sesión */
  logout: () => void;
  /** Inicializa el estado desde localStorage */
  initialize: () => void;
}

/**
 * Crea el store de autenticación con persistencia en localStorage.
 * 
 * @example
 * ```tsx
 * // En componente
 * const { user, isAuthenticated, logout } = useAuthStore();
 * 
 * // Login
 * setAuth(token, userData);
 * 
 * // Logout
 * logout();
 * ```
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: false,

      setAuth: (token: string, user: UserResponse) => {
        // Also store in localStorage for axios interceptor
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));

        set({
          token,
          user,
          isAuthenticated: true,
          isInitialized: true,
        });
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isInitialized: true,
        });
      },

      initialize: () => {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('auth_user');

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr) as UserResponse;
            set({
              token,
              user,
              isAuthenticated: true,
              isInitialized: true,
            });
          } catch {
            // Invalid data in localStorage, clear it
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            set({ isInitialized: true });
          }
        } else {
          set({ isInitialized: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist token and user, isAuthenticated and isInitialized are derived
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
