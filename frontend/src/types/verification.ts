export interface ProofStep {
  hash: string;
  position: 'LEFT' | 'RIGHT';
}

export interface VerificationResult {
  recordId: number;
  kittaNumber: string;
  valid: boolean;
  computedHash: string;
  storedHash: string;
  merkleRootHash: string;
  merkleProof: ProofStep[];
  message: string;
}

export interface ChainVerificationResult {
  valid: boolean;
  totalRecords: number;
  brokenAtIndex: number;
  message: string;
}
