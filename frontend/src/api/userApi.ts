import api from './axiosConfig';
import type { User } from '@/types/user';
import type { PageResponse } from './auditApi';

export const userApi = {
  getAll: (page: number = 0, size: number = 10) =>
    api.get<PageResponse<User>>('/admin/users', { params: { page, size } }),

  create: (data: { fullName: string; email: string; password: string; phone?: string; citizenshipNumber?: string; role: string; district?: string }) =>
    api.post<User>('/admin/users', data),

  updateStatus: (id: number, active: boolean) =>
    api.put<User>(`/admin/users/${id}/status`, { active }),
};
