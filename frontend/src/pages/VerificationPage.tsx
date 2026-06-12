import { useState } from 'react';
import { verificationApi } from '@/api/verificationApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';
import type { VerificationResult, ChainVerificationResult } from '@/types/verification';

export function VerificationPage() {
  const [recordId, setRecordId] = useState('');
  const [recordResult, setRecordResult] = useState<VerificationResult | null>(null);
  const [chainResult, setChainResult] = useState<ChainVerificationResult | null>(null);
  const [rootHash, setRootHash] = useState<string | null>(null);
  const [loading, setLoading] = useState({ record: false, chain: false, root: false });

  const verifyRecord = async () => {
    if (!recordId) return;
    setLoading((l) => ({ ...l, record: true }));
    setRecordResult(null);
    try {
      const res = await verificationApi.verifyRecord(Number(recordId));
      setRecordResult(res.data);
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
        description="Verify record integrity using Merkle Tree and Hash Chain"
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
            {rootHash && (
              <div className="mt-2 text-xs font-mono break-all bg-muted p-2 rounded">
                {rootHash}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {recordResult && (
        <Card className={`mt-6 border-l-[3px] ${recordResult.valid ? 'border-l-success' : 'border-l-destructive'}`}>
          <CardHeader>
            <CardTitle className={recordResult.valid ? 'text-success' : 'text-destructive'}>
              {recordResult.valid ? '✓ Record Verified' : '✗ Integrity Violation Detected'}
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
              <div>
                <p className="text-sm font-medium mb-2">Merkle Proof Path ({recordResult.merkleProof.length} steps)</p>
                <MerkleProofTree proof={recordResult.merkleProof} leafHash={recordResult.storedHash} rootHash={recordResult.merkleRootHash} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {chainResult && (
        <Card className={`mt-6 border-l-[3px] ${chainResult.valid ? 'border-l-success' : 'border-l-destructive'}`}>
          <CardHeader>
            <CardTitle className={chainResult.valid ? 'text-success' : 'text-destructive'}>
              {chainResult.valid ? '✓ Hash Chain Intact' : '✗ Chain Broken'}
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

function MerkleProofTree({ proof, leafHash, rootHash }: {
  proof: { hash: string; position: string }[];
  leafHash: string;
  rootHash: string;
}) {
  const truncate = (h: string) => h.slice(0, 8) + '...' + h.slice(-4);
  const nodeW = 120;
  const nodeH = 36;
  const gapY = 60;
  const levels = proof.length + 1;
  const svgW = 500;
  const svgH = levels * gapY + 40;

  return (
    <svg width={svgW} height={svgH} className="mx-auto">
      {/* Root at top */}
      <g transform={`translate(${svgW / 2 - nodeW / 2}, 10)`}>
        <rect width={nodeW} height={nodeH} rx={6} fill="#dcfce7" stroke="#16a34a" strokeWidth={2} />
        <text x={nodeW / 2} y={nodeH / 2 + 4} textAnchor="middle" fontSize={10} fontFamily="monospace" fill="#15803d">
          {truncate(rootHash)}
        </text>
        <text x={nodeW / 2} y={-4} textAnchor="middle" fontSize={9} fill="#6b7280">Root</text>
      </g>

      {/* Proof steps from root down */}
      {[...proof].reverse().map((step, i) => {
        const y = 10 + (i + 1) * gapY;
        const isLeft = step.position === 'LEFT';
        const proofX = svgW / 2 + (isLeft ? -nodeW - 20 : 20);

        return (
          <g key={i}>
            {/* Line from parent */}
            <line x1={svgW / 2} y1={y - gapY + nodeH + 10} x2={proofX + nodeW / 2} y2={y}
              stroke="#d1d5db" strokeWidth={1.5} />
            <line x1={svgW / 2} y1={y - gapY + nodeH + 10} x2={svgW / 2} y2={y}
              stroke="#16a34a" strokeWidth={2} />

            {/* Proof sibling node */}
            <g transform={`translate(${proofX}, ${y})`}>
              <rect width={nodeW} height={nodeH} rx={6} fill="#f3f4f6" stroke="#9ca3af" strokeWidth={1} />
              <text x={nodeW / 2} y={nodeH / 2 + 4} textAnchor="middle" fontSize={10} fontFamily="monospace" fill="#6b7280">
                {truncate(step.hash)}
              </text>
              <text x={nodeW / 2} y={-4} textAnchor="middle" fontSize={8} fill="#9ca3af">{step.position}</text>
            </g>

            {/* Path node */}
            <g transform={`translate(${svgW / 2 - nodeW / 2}, ${y})`}>
              <rect width={nodeW} height={nodeH} rx={6} fill="#dcfce7" stroke="#16a34a" strokeWidth={2} />
              <text x={nodeW / 2} y={nodeH / 2 + 4} textAnchor="middle" fontSize={10} fontFamily="monospace" fill="#15803d">
                {i === proof.length - 1 ? truncate(leafHash) : '•••'}
              </text>
              {i === proof.length - 1 && (
                <text x={nodeW / 2} y={nodeH + 14} textAnchor="middle" fontSize={9} fill="#16a34a">Leaf (Target)</text>
              )}
            </g>
          </g>
        );
      })}
    </svg>
  );
}
