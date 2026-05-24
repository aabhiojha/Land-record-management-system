export type TransferStatus = 'INITIATED' | 'OFFICER_VERIFIED' | 'ADMIN_APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Transfer {
  id: number;
  landRecordId: number;
  kittaNumber: string;
  sellerId: number;
  sellerName: string;
  buyerId: number;
  buyerName: string;
  status: TransferStatus;
  initiatedAt: string;
  officerVerifiedAt: string | null;
  verifiedByOfficerName: string | null;
  adminApprovedAt: string | null;
  approvedByAdminName: string | null;
  rejectionReason: string | null;
  oldRecordHash: string | null;
  newRecordHash: string | null;
}

export interface TransferRequest {
  landRecordId: number;
  buyerId: number;
}
