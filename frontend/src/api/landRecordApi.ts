import api from './axiosConfig';
import type { LandRecord, LandRecordRequest, OwnershipHistory } from '@/types/landRecord';
import type { User } from '@/types/user';

export const landRecordApi = {
  getAll: (search?: string) =>
    api.get<LandRecord[]>('/land-records', { params: search ? { search } : {} }),

  getById: (id: number) =>
    api.get<LandRecord>(`/land-records/${id}`),

  getHistory: (id: number) =>
    api.get<OwnershipHistory[]>(`/land-records/${id}/history`),

  getMyRecords: () =>
    api.get<LandRecord[]>('/citizen/my-records'),

  create: (data: LandRecordRequest) =>
    api.post<LandRecord>('/officer/land-records', data),

  getCitizens: () =>
    api.get<User[]>('/users/citizens'),
};
