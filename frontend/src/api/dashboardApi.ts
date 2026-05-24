import api from './axiosConfig';

export const dashboardApi = {
  getAdmin: () =>
    api.get<{ totalRecords: number; pendingApprovals: number; totalUsers: number; totalTransfers: number }>('/admin/dashboard'),

  getOfficer: () =>
    api.get<{ totalRecords: number; pendingVerifications: number; totalTransfers: number }>('/officer/dashboard'),

  getCitizen: () =>
    api.get<{ myRecords: number; myTransfers: number }>('/citizen/dashboard'),
};
