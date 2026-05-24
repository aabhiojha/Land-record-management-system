import api from './axiosConfig';
import type { User } from '@/types/user';

export const userApi = {
  getAll: () =>
    api.get<User[]>('/admin/users'),

  create: (data: { fullName: string; email: string; password: string; phone?: string; citizenshipNumber?: string; role: string; district?: string }) =>
    api.post<User>('/admin/users', data),

  updateStatus: (id: number, active: boolean) =>
    api.put<User>(`/admin/users/${id}/status`, { active }),
};
