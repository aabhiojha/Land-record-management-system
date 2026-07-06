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

export interface MerkleTreeNode {
  hash: string;
  leaf: boolean;
  duplicate: boolean;
  recordId: number | null;
  kittaNumber: string | null;
}

export interface MerkleTreeSnapshot {
  rootHash: string | null;
  leafCount: number;
  treeHeight: number;
  /** levels[0] = leaves in record order; last level = root. */
  levels: MerkleTreeNode[][];
}

export interface ChainVerificationResult {
  valid: boolean;
  totalRecords: number;
  brokenAtIndex: number;
  message: string;
}
