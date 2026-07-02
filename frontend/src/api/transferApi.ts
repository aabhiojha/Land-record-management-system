import api from './axiosConfig';
import type { Transfer, TransferRequest } from '@/types/transfer';
import type { PageResponse } from './auditApi';

export const transferApi = {
  initiate: (data: TransferRequest) =>
    api.post<Transfer>('/citizen/transfers', data),

  getMyTransfers: (page: number = 0, size: number = 10) =>
    api.get<PageResponse<Transfer>>('/citizen/transfers', { params: { page, size } }),

  getAllTransfers: (page: number = 0, size: number = 10) =>
    api.get<PageResponse<Transfer>>('/admin/transfers', { params: { page, size } }),

  getPendingVerification: () =>
    api.get<Transfer[]>('/officer/transfers/pending'),

  verify: (id: number) =>
    api.put<Transfer>(`/officer/transfers/${id}/verify`),

  getPendingApproval: () =>
    api.get<Transfer[]>('/admin/transfers/pending'),

  approve: (id: number) =>
    api.put<Transfer>(`/admin/transfers/${id}/approve`),

  reject: (id: number, reason: string) =>
    api.put<Transfer>(`/admin/transfers/${id}/reject`, { reason }),
};
