import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types/user';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RefreshResponse {
  token: string;
  refreshToken: string;
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
}

// A single in-flight refresh shared by every request that hits a 401 at the
// same time. Without this, a page that fires N requests on load would trigger
// N parallel refresh calls and racing writes to the auth store.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) throw new Error('No refresh token');

  // Bare axios (not `api`) so this call skips the interceptors below.
  const res = await axios.post<RefreshResponse>('/api/auth/refresh', { refreshToken });
  const data = res.data;

  useAuthStore.getState().setAuth({
    token: data.token,
    refreshToken: data.refreshToken,
    userId: data.userId,
    fullName: data.fullName,
    email: data.email,
    role: data.role,
  });

  return data.token;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Not a 401 we can recover from — pass it through untouched.
    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If the refresh call itself 401s, the session is truly done.
    if (originalRequest.url?.includes('/auth/refresh')) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Join the in-flight refresh, or start one and clear it once settled.
      refreshPromise ??= refreshAccessToken().finally(() => { refreshPromise = null; });
      const newToken = await refreshPromise;

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    }
  }
);

export default api;
