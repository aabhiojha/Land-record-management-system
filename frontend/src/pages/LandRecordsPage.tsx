import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { landRecordApi } from '@/api/landRecordApi';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { PaginationControls } from '@/components/common/PaginationControls';
import { useDebounce } from '@/hooks/useDebounce';
import type { LandRecord } from '@/types/landRecord';

export function LandRecordsPage() {
  const role = useAuthStore((s) => s.role);
  const [records, setRecords] = useState<LandRecord[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadRecords = useCallback(async (query?: string, pageNumber: number = 0) => {
    try {
      setLoading(true);
      const res = await landRecordApi.getAll(query, pageNumber, 10);
      setRecords(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRecords(debouncedSearch || undefined, page);
  }, [loadRecords, debouncedSearch, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  return (
    <div>
      <PageHeader
        title="Land Records"
        action={
          role === 'MALPOT_OFFICER' ? (
            <Link to="/land-records/new">
              <Button>New record</Button>
            </Link>
          ) : undefined
        }
      />

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          placeholder="Search by kitta number or district"
          value={search}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : records.length === 0 ? (
        <EmptyState message="No land records found" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kitta No.</TableHead>
                <TableHead>Area (sq.m)</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Municipality</TableHead>
                <TableHead>Ward</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <Link to={`/land-records/${r.id}`} className="font-medium text-primary hover:underline">
                      {r.kittaNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{r.areaSqMeters.toLocaleString()}</TableCell>
                  <TableCell>{r.district}</TableCell>
                  <TableCell>{r.municipality}</TableCell>
                  <TableCell>{r.wardNumber}</TableCell>
                  <TableCell><StatusBadge status={r.landType} /></TableCell>
                  <TableCell>{r.ownerName}</TableCell>
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
