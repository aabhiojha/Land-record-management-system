export type LandType = 'AABAD' | 'KHET' | 'PAKHO';

export interface LandRecord {
  id: number;
  kittaNumber: string;
  areaSqMeters: number;
  district: string;
  municipality: string;
  wardNumber: number;
  landType: LandType;
  ownerId: number;
  ownerName: string;
  recordHash: string;
  previousRecordHash: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LandRecordRequest {
  kittaNumber: string;
  areaSqMeters: number;
  district: string;
  municipality: string;
  wardNumber: number;
  landType: string;
  ownerId: number;
}

export interface OwnershipHistory {
  id: number;
  landRecordId: number;
  ownerId: number;
  ownerName: string;
  transferId: number | null;
  recordHash: string;
  ownedFrom: string;
  ownedUntil: string | null;
}
