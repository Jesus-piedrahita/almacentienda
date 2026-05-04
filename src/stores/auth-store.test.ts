import { beforeEach, describe, expect, it } from 'vitest';

import type { UserResponse } from '@/lib/api';
import { useAuthStore } from './auth-store';

const mockUser: UserResponse = {
  id: 7,
  email: 'cajero@test.com',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
};

function resetStore() {
  useAuthStore.setState({
    user: null,
    token: null,
    sessionId: null,
    isAuthenticated: false,
    isInitialized: false,
  });
  localStorage.clear();
}

describe('useAuthStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('setAuth persiste token, user y sessionId y autentica el store', () => {
    useAuthStore.getState().setAuth('jwt-token', mockUser, 'session-123');

    const state = useAuthStore.getState();
    expect(state.token).toBe('jwt-token');
    expect(state.user).toEqual(mockUser);
    expect(state.sessionId).toBe('session-123');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isInitialized).toBe(true);
    expect(localStorage.getItem('auth_token')).toBe('jwt-token');
    expect(localStorage.getItem('auth_user')).toBe(JSON.stringify(mockUser));
    expect(localStorage.getItem('auth_session_id')).toBe('session-123');
  });

  it('logout limpia estado autenticado y borra localStorage', () => {
    useAuthStore.setState({
      user: mockUser,
      token: 'jwt-token',
      sessionId: 'session-123',
      isAuthenticated: true,
      isInitialized: true,
    });
    localStorage.setItem('auth_token', 'jwt-token');
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    localStorage.setItem('auth_session_id', 'session-123');

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.sessionId).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isInitialized).toBe(true);
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
    expect(localStorage.getItem('auth_session_id')).toBeNull();
  });

  it('initialize hidrata estado autenticado cuando localStorage es válido', () => {
    localStorage.setItem('auth_token', 'jwt-token');
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    localStorage.setItem('auth_session_id', 'session-123');

    useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.token).toBe('jwt-token');
    expect(state.user).toEqual(mockUser);
    expect(state.sessionId).toBe('session-123');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isInitialized).toBe(true);
  });

  it('initialize solo marca isInitialized cuando faltan datos de sesión', () => {
    localStorage.setItem('auth_token', 'jwt-token');

    useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.sessionId).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isInitialized).toBe(true);
  });

  it('initialize limpia localStorage corrupto y evita autenticación falsa', () => {
    localStorage.setItem('auth_token', 'jwt-token');
    localStorage.setItem('auth_user', '{ json-roto');
    localStorage.setItem('auth_session_id', 'session-123');

    useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.sessionId).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isInitialized).toBe(true);
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
    expect(localStorage.getItem('auth_session_id')).toBeNull();
  });
});
