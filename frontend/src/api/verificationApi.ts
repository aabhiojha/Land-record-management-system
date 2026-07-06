import api from './axiosConfig';
import type { VerificationResult, ChainVerificationResult, ProofStep, MerkleTreeSnapshot } from '@/types/verification';

export const verificationApi = {
  verifyRecord: (id: number) =>
    api.get<VerificationResult>(`/verification/record/${id}`),

  verifyChain: () =>
    api.get<ChainVerificationResult>('/verification/chain'),

  getTreeRoot: () =>
    api.get<{ rootHash: string; message: string }>('/verification/tree-root'),

  getProof: (id: number) =>
    api.get<ProofStep[]>(`/verification/record/${id}/proof`),

  getTree: () =>
    api.get<MerkleTreeSnapshot>('/verification/tree'),
};
