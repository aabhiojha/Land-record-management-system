import api from './axiosConfig';
import type { Document } from '@/types/document';

export const documentApi = {
  upload: (file: File, landRecordId: number, documentType: string, transferId?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('landRecordId', landRecordId.toString());
    formData.append('documentType', documentType);
    if (transferId) formData.append('transferId', transferId.toString());
    return api.post<Document>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getByRecord: (recordId: number) =>
    api.get<Document[]>(`/documents/record/${recordId}`),

  download: (id: number) =>
    api.get(`/documents/${id}/download`, { responseType: 'blob' }),

  verify: (id: number) =>
    api.put<Document>(`/officer/documents/${id}/verify`),
};
