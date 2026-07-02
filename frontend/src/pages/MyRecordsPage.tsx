import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { landRecordApi } from '@/api/landRecordApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { PaginationControls } from '@/components/common/PaginationControls';
import type { LandRecord } from '@/types/landRecord';

export function MyRecordsPage() {
  const [records, setRecords] = useState<LandRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setLoading(true);
    landRecordApi.getMyRecords(page, 10)
      .then((res) => {
        setRecords(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <PageHeader title="My Land Records" description="Land records registered under your name" />

      {loading ? (
        <LoadingSpinner />
      ) : records.length === 0 ? (
        <EmptyState message="No land records found" description="You don't own any registered land records yet" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kitta No.</TableHead>
                <TableHead>Area (sq.m)</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Municipality</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link to={`/land-records/${r.id}`} className="font-medium text-primary hover:underline">
                      {r.kittaNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{r.areaSqMeters.toLocaleString()}</TableCell>
                  <TableCell>{r.district}</TableCell>
                  <TableCell>{r.municipality}</TableCell>
                  <TableCell><StatusBadge status={r.landType} /></TableCell>
                  <TableCell>
                    <Link to={`/transfers/new?recordId=${r.id}`}>
                      <Button variant="outline" size="sm">Transfer</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!loading && records.length > 0 && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          loading={loading}
        />
      )}
    </div>
  );
}
