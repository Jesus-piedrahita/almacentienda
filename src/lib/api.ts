/**
 * @fileoverview Axios instance configuration for API requests.
 * Centralized HTTP client with JWT authentication and error handling.
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import type {
  SessionActivityAccepted,
  SessionActivityPayload,
  SessionTraceDetail,
  SessionTraceSummary,
} from '@/types/session-traceability';

/**
 * Base URL for the API.
 * Configure via VITE_API_URL environment variable.
 * Defaults to localhost:8000 for development.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function parseDevDelayMs(rawValue: string | undefined): number {
  if (!rawValue) {
    return 0;
  }

  const parsed = Number(rawValue);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return parsed;
}

function shouldEnableDevApiDelay(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_API_DELAY === 'true';
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

const DEV_API_DELAY_MS = parseDevDelayMs(import.meta.env.VITE_DEV_API_DELAY_MS);
const IS_DEV_API_DELAY_ENABLED = shouldEnableDevApiDelay() && DEV_API_DELAY_MS > 0;

/**
 * Creates and configures an Axios instance with interceptors.
 * - Adds JWT token to requests if available
 * - Handles 401 errors globally
 * - Sets base URL for all requests
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Request interceptor - adds JWT token to Authorization header
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (set by auth store)
    const token = localStorage.getItem('auth_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handles 401 errors globally
 */
api.interceptors.response.use(
  async (response) => {
    if (IS_DEV_API_DELAY_ENABLED) {
      await delay(DEV_API_DELAY_MS);
    }

    return response;
  },
  async (error: AxiosError<{ detail?: string }>) => {
    if (IS_DEV_API_DELAY_ENABLED) {
      await delay(DEV_API_DELAY_MS);
    }

    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_session_id');

      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Type exports for use throughout the app
export interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
  session_id: string;
  user: UserResponse;
}

export interface UserResponse {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

interface ApiSessionActivityPayload {
  event_type: SessionActivityPayload['eventType'];
  route?: string;
  metadata?: Record<string, string>;
}

interface ApiSessionActivityAccepted {
  session_id: string;
  event_type: SessionActivityAccepted['eventType'];
  recorded_at: string;
}

interface ApiSessionTraceSummary {
  session_id: string;
  user_id: number;
  user_email: string;
  started_at: string;
  last_seen_at: string;
  ended_at: string | null;
  end_reason: SessionTraceSummary['endReason'];
  replaced_by_session_id: string | null;
  is_active: boolean;
  duration_seconds: number;
  latest_activity_at: string | null;
  latest_activity_type: SessionTraceSummary['latestActivityType'];
  visited_routes: string[];
}

interface ApiSessionActivityRecord {
  id: number;
  event_type: SessionActivityAccepted['eventType'];
  route: string | null;
  occurred_at: string;
  metadata: Record<string, string>;
}

interface ApiSessionTraceDetail extends ApiSessionTraceSummary {
  ip_address: string | null;
  user_agent: string | null;
  activities: ApiSessionActivityRecord[];
}

function mapSessionTraceSummary(summary: ApiSessionTraceSummary): SessionTraceSummary {
  return {
    sessionId: summary.session_id,
    userId: summary.user_id,
    userEmail: summary.user_email,
    startedAt: summary.started_at,
    lastSeenAt: summary.last_seen_at,
    endedAt: summary.ended_at,
    endReason: summary.end_reason,
    replacedBySessionId: summary.replaced_by_session_id,
    isActive: summary.is_active,
    durationSeconds: summary.duration_seconds,
    latestActivityAt: summary.latest_activity_at,
    latestActivityType: summary.latest_activity_type,
    visitedRoutes: summary.visited_routes,
  };
}

function mapSessionTraceDetail(detail: ApiSessionTraceDetail): SessionTraceDetail {
  return {
    ...mapSessionTraceSummary(detail),
    ipAddress: detail.ip_address,
    userAgent: detail.user_agent,
    activities: detail.activities.map((activity) => ({
      id: activity.id,
      eventType: activity.event_type,
      route: activity.route,
      occurredAt: activity.occurred_at,
      metadata: activity.metadata,
    })),
  };
}

export async function logoutSession() {
  await api.post('/api/auth/logout');
}

export async function ingestSessionActivity(payload: SessionActivityPayload): Promise<SessionActivityAccepted> {
  const response = await api.post<ApiSessionActivityAccepted, { data: ApiSessionActivityAccepted }, ApiSessionActivityPayload>(
    '/api/session-traceability/activity',
    {
      event_type: payload.eventType,
      route: payload.route,
      metadata: payload.metadata,
    }
  );

  return {
    sessionId: response.data.session_id,
    eventType: response.data.event_type,
    recordedAt: response.data.recorded_at,
  };
}

export async function fetchSessionTraces(): Promise<SessionTraceSummary[]> {
  const response = await api.get<ApiSessionTraceSummary[]>('/api/session-traceability/sessions');
  return response.data.map(mapSessionTraceSummary);
}

export async function fetchSessionTraceDetail(sessionId: string): Promise<SessionTraceDetail> {
  const response = await api.get<ApiSessionTraceDetail>(`/api/session-traceability/sessions/${sessionId}`);
  return mapSessionTraceDetail(response.data);
}

export async function uploadTransferProof(proofId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return api.post(`/api/transfers/${proofId}/proof`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export { DEV_API_DELAY_MS, IS_DEV_API_DELAY_ENABLED, parseDevDelayMs };
