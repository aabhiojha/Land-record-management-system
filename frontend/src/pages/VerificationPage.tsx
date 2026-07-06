import { useState } from 'react';
import { verificationApi } from '@/api/verificationApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';
import { MerkleTreeView } from '@/components/verification/MerkleTreeView';
import type { VerificationResult, ChainVerificationResult, MerkleTreeSnapshot } from '@/types/verification';

export function VerificationPage() {
  const [recordId, setRecordId] = useState('');
  const [recordResult, setRecordResult] = useState<VerificationResult | null>(null);
  const [chainResult, setChainResult] = useState<ChainVerificationResult | null>(null);
  const [rootHash, setRootHash] = useState<string | null>(null);
  const [tree, setTree] = useState<MerkleTreeSnapshot | null>(null);
  const [loading, setLoading] = useState({ record: false, chain: false, root: false, tree: false });

  const loadTree = async () => {
    setLoading((l) => ({ ...l, tree: true }));
    try {
      const res = await verificationApi.getTree();
      setTree(res.data);
    } catch {
      /* empty */
    } finally {
      setLoading((l) => ({ ...l, tree: false }));
    }
  };

  const verifyRecord = async () => {
    if (!recordId) return;
    setLoading((l) => ({ ...l, record: true }));
    setRecordResult(null);
    try {
      const res = await verificationApi.verifyRecord(Number(recordId));
      setRecordResult(res.data);
      loadTree(); // refresh the tree so the verified record's path is highlighted
    } catch {
      /* empty */
    } finally {
      setLoading((l) => ({ ...l, record: false }));
    }
  };

  const verifyChain = async () => {
    setLoading((l) => ({ ...l, chain: true }));
    setChainResult(null);
    try {
      const res = await verificationApi.verifyChain();
      setChainResult(res.data);
    } catch {
      /* empty */
    } finally {
      setLoading((l) => ({ ...l, chain: false }));
    }
  };

  const fetchRoot = async () => {
    setLoading((l) => ({ ...l, root: true }));
    try {
      const res = await verificationApi.getTreeRoot();
      setRootHash(res.data.rootHash);
    } catch {
      /* empty */
    } finally {
      setLoading((l) => ({ ...l, root: false }));
    }
  };

  return (
    <div>
      <PageHeader
        title="Verification"
        description="Check records against the Merkle tree and hash chain."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-lg">Verify Single Record</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Enter record ID"
              value={recordId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecordId(e.target.value)}
              type="number"
            />
            <Button onClick={verifyRecord} disabled={loading.record} className="w-full">
              {loading.record ? 'Verifying...' : 'Verify Record'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Hash Chain Integrity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Verify that the sequential hash chain of all records is intact.
            </p>
            <Button onClick={verifyChain} disabled={loading.chain} className="w-full">
              {loading.chain ? 'Verifying...' : 'Verify Full Chain'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Merkle Tree Root</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Fetch the current Merkle tree root hash.
            </p>
            <Button onClick={fetchRoot} disabled={loading.root} className="w-full">
              {loading.root ? 'Fetching...' : 'Get Root Hash'}
            </Button>
            <Button onClick={loadTree} disabled={loading.tree} variant="outline" className="w-full">
              {loading.tree ? 'Loading...' : 'View Merkle Tree'}
            </Button>
            {rootHash && (
              <div className="mt-2 text-xs font-mono break-all bg-muted p-2 rounded">
                {rootHash}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {recordResult && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className={recordResult.valid ? 'text-green-700' : 'text-destructive'}>
              {recordResult.valid ? 'Record verified' : 'Integrity violation detected'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{recordResult.message}</p>
            <div className="grid gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Record: </span>
                <span className="font-medium">{recordResult.kittaNumber} (ID: {recordResult.recordId})</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium">Hashes:</p>
              <div className="text-xs font-mono bg-muted p-3 rounded space-y-1">
                <div><span className="text-muted-foreground">Computed: </span>{recordResult.computedHash}</div>
                <div><span className="text-muted-foreground">Stored:   </span>{recordResult.storedHash}</div>
                <div><span className="text-muted-foreground">Root:     </span>{recordResult.merkleRootHash}</div>
              </div>
            </div>

            {recordResult.merkleProof.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Merkle proof: {recordResult.merkleProof.length} step{recordResult.merkleProof.length === 1 ? '' : 's'} —
                the record's path through the tree is highlighted below.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {tree && tree.levels.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Merkle Tree</CardTitle>
          </CardHeader>
          <CardContent>
            <MerkleTreeView tree={tree} highlightRecordId={recordResult?.recordId ?? null} />
          </CardContent>
        </Card>
      )}

      {chainResult && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className={chainResult.valid ? 'text-green-700' : 'text-destructive'}>
              {chainResult.valid ? 'Hash chain intact' : 'Hash chain broken'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{chainResult.message}</p>
            <p className="text-sm text-muted-foreground mt-1">Total records: {chainResult.totalRecords}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
