export type DocumentType = 'LALPURJA' | 'NAAPI_NAKSHA' | 'CITIZENSHIP' | 'OTHER';

export interface Document {
  id: number;
  landRecordId: number;
  transferId: number | null;
  uploadedByName: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  documentType: DocumentType;
  documentHash: string;
  isVerified: boolean;
  verifiedByName: string | null;
  createdAt: string;
}
