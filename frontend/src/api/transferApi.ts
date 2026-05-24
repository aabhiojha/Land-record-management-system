import api from './axiosConfig';
import type { Transfer, TransferRequest } from '@/types/transfer';

export const transferApi = {
  initiate: (data: TransferRequest) =>
    api.post<Transfer>('/citizen/transfers', data),

  getMyTransfers: () =>
    api.get<Transfer[]>('/citizen/transfers'),

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
