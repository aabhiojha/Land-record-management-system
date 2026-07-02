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
import { PaginationControls } from '@/components/common/PaginationControls';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { landRecordApi } from '@/api/landRecordApi';
import type { Transfer } from '@/types/transfer';
import type { LandRecord } from '@/types/landRecord';

export function TransfersPage() {
  const role = useAuthStore((s) => s.role);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedLandRecord, setSelectedLandRecord] = useState<LandRecord | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadTransfers = useCallback(async (pageNumber: number = 0) => {
    try {
      setLoading(true);
      if (role === 'SUPER_ADMIN') {
        const res = await transferApi.getAllTransfers(pageNumber);
        setTransfers(res.data.content);
        setTotalPages(res.data.totalPages);
      } else if (role === 'MALPOT_OFFICER') {
        const res = await transferApi.getPendingVerification();
        setTransfers(res.data);
        setTotalPages(1); // Not paginated
      } else {
        const res = await transferApi.getMyTransfers(pageNumber);
        setTransfers(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTransfers(page);
  }, [loadTransfers, page]);

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

  const handleViewLandRecord = async (landRecordId: number) => {
    setDialogOpen(true);
    setDetailsLoading(true);
    try {
      const res = await landRecordApi.getById(landRecordId);
      setSelectedLandRecord(res.data);
    } catch {
      /* empty */
    } finally {
      setDetailsLoading(false);
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
            <Link to="/transfers/new"><Button>New transfer</Button></Link>
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
                  <TableCell className="font-medium">
                    <button 
                      className="text-primary hover:underline font-medium text-left"
                      onClick={() => handleViewLandRecord(t.landRecordId)}
                    >
                      {t.kittaNumber}
                    </button>
                  </TableCell>
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

      {!loading && transfers.length > 0 && role !== 'MALPOT_OFFICER' && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          loading={loading}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Land Record Details</DialogTitle>
            <DialogDescription>
              Information for Kitta Number: <span className="font-medium text-foreground">{selectedLandRecord?.kittaNumber}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {detailsLoading ? (
              <div className="py-8"><LoadingSpinner /></div>
            ) : selectedLandRecord ? (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <p className="text-muted-foreground mb-1">District</p>
                    <p className="font-medium">{selectedLandRecord.district}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Municipality</p>
                    <p className="font-medium">{selectedLandRecord.municipality}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Ward Number</p>
                    <p className="font-medium">{selectedLandRecord.wardNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Area (sq. meters)</p>
                    <p className="font-medium">{selectedLandRecord.areaSqMeters}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Land Type</p>
                    <p className="font-medium">{selectedLandRecord.landType}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">Failed to load details.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
