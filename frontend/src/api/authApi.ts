import api from './axiosConfig';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/user';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data),

  getMe: () =>
    api.get<User>('/auth/me'),
};
