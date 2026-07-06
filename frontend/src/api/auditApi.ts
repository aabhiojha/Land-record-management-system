import api from './axiosConfig';

export interface AuditLog {
  id: number;
  system: boolean;
  userName: string | null;
  userEmail: string | null;
  userRole: string | null;
  action: string;
  entityType: string;
  entityLabel: string | null;
  landRecordId: number | null;
  details: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-indexed)
  size: number;
}

export const auditApi = {
  getLogs: (page: number = 0, size: number = 10) => 
    api.get<PageResponse<AuditLog>>('/admin/audit', { params: { page, size } }),
};
