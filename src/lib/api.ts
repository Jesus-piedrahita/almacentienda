/**
 * @fileoverview Axios instance configuration for API requests.
 * Centralized HTTP client with JWT authentication and error handling.
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

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
