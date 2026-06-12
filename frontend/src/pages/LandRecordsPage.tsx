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
import type { LandRecord } from '@/types/landRecord';

export function LandRecordsPage() {
  const role = useAuthStore((s) => s.role);
  const [records, setRecords] = useState<LandRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadRecords = useCallback(async (query?: string) => {
    try {
      const res = await landRecordApi.getAll(query);
      setRecords(res.data);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // state updates happen only after the fetch resolves
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRecords();
  }, [loadRecords]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    loadRecords(search || undefined);
  };

  return (
    <div>
      <PageHeader
        title="Land Records"
        description="Browse and search all registered land records"
        action={
          role === 'MALPOT_OFFICER' ? (
            <Link to="/land-records/new">
              <Button>+ New Record</Button>
            </Link>
          ) : undefined
        }
      />

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          placeholder="Search by kitta number or district..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
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
    </div>
  );
}
