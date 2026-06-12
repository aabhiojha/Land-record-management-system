import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { transferApi } from '@/api/transferApi';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import type { Transfer } from '@/types/transfer';

export function TransfersPage() {
  const role = useAuthStore((s) => s.role);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadTransfers = useCallback(async () => {
    try {
      let res;
      if (role === 'SUPER_ADMIN') res = await transferApi.getPendingApproval();
      else if (role === 'MALPOT_OFFICER') res = await transferApi.getPendingVerification();
      else res = await transferApi.getMyTransfers();
      setTransfers(res.data);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    // state updates happen only after the fetch resolves
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTransfers();
  }, [loadTransfers]);

  const handleVerify = async (id: number) => {
    setActionLoading(id);
    try {
      await transferApi.verify(id);
      loadTransfers();
    } catch {
      /* empty */
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await transferApi.approve(id);
      loadTransfers();
    } catch {
      /* empty */
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    setActionLoading(id);
    try {
      await transferApi.reject(id, reason);
      loadTransfers();
    } catch {
      /* empty */
    } finally {
      setActionLoading(null);
    }
  };

  const title = role === 'SUPER_ADMIN' ? 'Pending Approvals'
    : role === 'MALPOT_OFFICER' ? 'Pending Verifications'
    : 'My Transfers';

  return (
    <div>
      <PageHeader
        title={title}
        action={
          role === 'CITIZEN' ? (
            <Link to="/transfers/new"><Button>+ New Transfer</Button></Link>
          ) : undefined
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : transfers.length === 0 ? (
        <EmptyState message="No transfers found" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kitta No.</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                {role !== 'CITIZEN' && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.kittaNumber}</TableCell>
                  <TableCell>{t.sellerName}</TableCell>
                  <TableCell>{t.buyerName}</TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                  <TableCell>{new Date(t.initiatedAt).toLocaleDateString()}</TableCell>
                  {role !== 'CITIZEN' && (
                    <TableCell>
                      <div className="flex gap-2">
                        {role === 'MALPOT_OFFICER' && t.status === 'INITIATED' && (
                          <Button size="sm" onClick={() => handleVerify(t.id)}
                            disabled={actionLoading === t.id}>
                            Verify
                          </Button>
                        )}
                        {role === 'SUPER_ADMIN' && t.status === 'OFFICER_VERIFIED' && (
                          <>
                            <Button size="sm" onClick={() => handleApprove(t.id)}
                              disabled={actionLoading === t.id}>
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleReject(t.id)}
                              disabled={actionLoading === t.id}>
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
