import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { landRecordApi } from '@/api/landRecordApi';
import { verificationApi } from '@/api/verificationApi';
import { documentApi } from '@/api/documentApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { LandRecord, OwnershipHistory } from '@/types/landRecord';
import type { VerificationResult } from '@/types/verification';
import type { Document } from '@/types/document';

export function LandRecordDetailPage() {
  const { id } = useParams();
  const [record, setRecord] = useState<LandRecord | null>(null);
  const [history, setHistory] = useState<OwnershipHistory[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [recordRes, historyRes, docsRes] = await Promise.all([
          landRecordApi.getById(Number(id)),
          landRecordApi.getHistory(Number(id)),
          documentApi.getByRecord(Number(id)),
        ]);
        setRecord(recordRes.data);
        setHistory(historyRes.data);
        setDocs(docsRes.data);
      } catch {
        /* empty */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleVerify = async () => {
    if (!id) return;
    setVerifying(true);
    try {
      const res = await verificationApi.verifyRecord(Number(id));
      setVerification(res.data);
    } catch {
      /* empty */
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!record) return <p>Record not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/land-records" className="text-sm text-muted-foreground hover:underline">
            ← Back to records
          </Link>
          <h1 className="text-3xl font-bold mt-1">{record.kittaNumber}</h1>
        </div>
        <Button onClick={handleVerify} disabled={verifying}>
          {verifying ? 'Verifying...' : 'Verify Integrity'}
        </Button>
      </div>

      {verification && (
        <Card className={verification.valid ? 'border-l-[3px] border-l-success' : 'border-l-[3px] border-l-destructive'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-lg font-bold ${verification.valid ? 'text-success' : 'text-destructive'}`}>
                {verification.valid ? '✓ VERIFIED' : '✗ INTEGRITY VIOLATION'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{verification.message}</p>
            <div className="mt-3 grid grid-cols-1 gap-2 text-xs font-mono">
              <div><span className="text-muted-foreground">Computed: </span>{verification.computedHash}</div>
              <div><span className="text-muted-foreground">Stored:   </span>{verification.storedHash}</div>
              <div><span className="text-muted-foreground">Root:     </span>{verification.merkleRootHash}</div>
            </div>
            {verification.merkleProof.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium mb-1">Merkle Proof Path ({verification.merkleProof.length} steps):</p>
                {verification.merkleProof.map((step, i) => (
                  <div key={i} className="text-xs font-mono text-muted-foreground">
                    Step {i + 1}: {step.position} → {step.hash.slice(0, 16)}...
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Record Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Kitta Number" value={record.kittaNumber} />
            <DetailRow label="Area" value={`${record.areaSqMeters.toLocaleString()} sq.m`} />
            <DetailRow label="District" value={record.district} />
            <DetailRow label="Municipality" value={record.municipality} />
            <DetailRow label="Ward" value={String(record.wardNumber)} />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Land Type</span>
              <StatusBadge status={record.landType} />
            </div>
            <DetailRow label="Owner" value={record.ownerName} />
            <DetailRow label="Created" value={new Date(record.createdAt).toLocaleDateString()} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Hash Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Record Hash</p>
              <p className="text-xs font-mono break-all bg-muted p-2 rounded">{record.recordHash || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Previous Record Hash</p>
              <p className="text-xs font-mono break-all bg-muted p-2 rounded">{record.previousRecordHash || 'Genesis'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Ownership History</CardTitle></CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No history available</p>
          ) : (
            <div className="space-y-4">
              {history.map((h, i) => (
                <div key={h.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${!h.ownedUntil ? 'bg-success' : 'bg-muted-foreground'}`} />
                    {i < history.length - 1 && <div className="w-0.5 flex-1 bg-border" />}
                  </div>
                  <div className="pb-4">
                    <p className="font-medium">{h.ownerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(h.ownedFrom).toLocaleDateString()}
                      {h.ownedUntil ? ` — ${new Date(h.ownedUntil).toLocaleDateString()}` : ' — Present'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Documents ({docs.length})</CardTitle></CardHeader>
        <CardContent>
          {docs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents uploaded</p>
          ) : (
            <div className="space-y-2">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium text-sm">{doc.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.documentType} · {(doc.fileSize / 1024).toFixed(1)} KB · {doc.uploadedByName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={doc.isVerified ? 'VERIFIED' : 'UNVERIFIED'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
