import api from './axiosConfig';
import type { LandRecord, LandRecordRequest, OwnershipHistory } from '@/types/landRecord';
import type { User } from '@/types/user';
import type { PageResponse } from './auditApi';

export const landRecordApi = {
  getAll: (search?: string, page: number = 0, size: number = 10) =>
    api.get<PageResponse<LandRecord>>('/land-records', { params: search ? { search, page, size } : { page, size } }),

  getById: (id: number) =>
    api.get<LandRecord>(`/land-records/${id}`),

  getHistory: (id: number) =>
    api.get<OwnershipHistory[]>(`/land-records/${id}/history`),

  getMyRecords: (page: number = 0, size: number = 10) =>
    api.get<PageResponse<LandRecord>>('/citizen/my-records', { params: { page, size } }),

  create: (data: LandRecordRequest) =>
    api.post<LandRecord>('/officer/land-records', data),

  createBulk: (data: LandRecordRequest[]) =>
    api.post<LandRecord[]>('/officer/land-records/bulk', data),

  searchBuyer: (citizenshipNumber: string, email: string) =>
    api.get<User>('/citizen/buyer-search', { params: { citizenshipNumber, email } }),

  getCitizensForOfficer: (page: number = 0, size: number = 10) =>
    api.get<PageResponse<User>>('/officer/citizens', { params: { page, size } }),
};
