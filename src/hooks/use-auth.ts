/**
 * @fileoverview Custom React Query hooks for authentication.
 * Provides useLogin, useRegister, and useCurrentUser hooks.
 */

import { useMutation, useQuery } from '@tanstack/react-query';

import api, {
  fetchSessionTraceDetail,
  fetchSessionTraces,
  ingestSessionActivity,
  logoutSession,
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type UserResponse,
} from '@/lib/api';
import type {
  SessionActivityAccepted,
  SessionActivityPayload,
  SessionTraceDetail,
  SessionTraceSummary,
} from '@/types/session-traceability';

/**
 * Hook para iniciar sesión.
 * Realiza una mutación POST a /api/auth/login.
 * 
 * @returns Mutación de React Query con datos de LoginResponse
 * 
 * @example
 * ```tsx
 * const { mutate, isPending } = useLogin();
 * 
 * mutate(
 *   { email: 'user@example.com', password: 'password123' },
 *   {
 *     onSuccess: (data) => {
 *       console.log('Token:', data.access_token);
 *     },
 *     onError: (error) => {
 *       console.error('Login failed:', error);
 *     }
 *   }
 * );
 * ```
 */
export function useLogin() {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (credentials: LoginRequest) => {
      // Use form-encoded for OAuth2 compatibility
      const formData = new URLSearchParams();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);
      
      const response = await api.post<LoginResponse>('/api/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      return response.data;
    },
  });
}

/**
 * Hook para registrar un nuevo usuario.
 * Realiza una mutación POST a /api/auth/register.
 * 
 * @returns Mutación de React Query con datos de UserResponse
 * 
 * @example
 * ```tsx
 * const { mutate, isPending } = useRegister();
 * 
 * mutate(
 *   { email: 'new@example.com', password: 'password123' },
 *   {
 *     onSuccess: (data) => {
 *       console.log('User created:', data.email);
 *     }
 *   }
 * );
 * ```
 */
export function useRegister() {
  return useMutation<UserResponse, Error, RegisterRequest>({
    mutationFn: async (userData: RegisterRequest) => {
      const response = await api.post<UserResponse>('/api/auth/register', userData);
      return response.data;
    },
  });
}

/**
 * Hook para obtener el usuario actual autenticado.
 * Realiza una query GET a /api/auth/me.
 * Requiere token de autenticación.
 * 
 * @returns Query de React Query con datos de UserResponse
 * 
 * @example
 * ```tsx
 * const { data: user, isLoading, error } = useCurrentUser();
 * 
 * if (isLoading) return <Loading />;
 * if (error) return <Error />;
 * return <UserProfile user={user} />;
 * ```
 */
export function useCurrentUser() {
  return useQuery<UserResponse, Error>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get<UserResponse>('/api/auth/me');
      return response.data;
    },
    // Don't retry on 401 - user is not authenticated
    retry: false,
    // Don't fetch if no token in localStorage
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('auth_token'),
  });
}

export const sessionTraceabilityQueryKeys = {
  all: ['session-traceability'] as const,
  list: () => ['session-traceability', 'list'] as const,
  detail: (sessionId: string) => ['session-traceability', 'detail', sessionId] as const,
};

export function useLogout() {
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await logoutSession();
    },
  });
}

export function useTrackSessionActivity() {
  return useMutation<SessionActivityAccepted, Error, SessionActivityPayload>({
    mutationFn: ingestSessionActivity,
  });
}

export function useSessionTraces() {
  return useQuery<SessionTraceSummary[], Error>({
    queryKey: sessionTraceabilityQueryKeys.list(),
    queryFn: fetchSessionTraces,
  });
}

export function useSessionTraceDetail(sessionId: string | null) {
  return useQuery<SessionTraceDetail, Error>({
    queryKey: sessionTraceabilityQueryKeys.detail(sessionId ?? ''),
    queryFn: async () => fetchSessionTraceDetail(sessionId ?? ''),
    enabled: !!sessionId,
  });
}
