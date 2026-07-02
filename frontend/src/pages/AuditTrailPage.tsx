import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { auditApi } from '@/api/auditApi';
import type { AuditLog } from '@/api/auditApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import { PaginationControls } from '@/components/common/PaginationControls';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { actionClasses, relativeTime } from '@/lib/auditFormat';

// Link the target to its record page when we have one; otherwise show plain text.
function TargetCell({ log }: { log: AuditLog }) {
  const label = (
    <>
      {log.entityType} <span className="text-muted-foreground">#{log.entityId}</span>
    </>
  );
  if (log.entityType === 'LandRecord' && log.entityId != null) {
    return (
      <Link to={`/land-records/${log.entityId}`} className="text-primary hover:underline">
        {label}
      </Link>
    );
  }
  return <span>{label}</span>;
}

export function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    auditApi.getLogs(page, 10)
      .then(res => {
        if (active) {
          setLogs(res.data.content);
          setTotalPages(res.data.totalPages);
          setTotalElements(res.data.totalElements);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Activity size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Audit Trail</h1>
          <p className="text-muted-foreground">Immutable history of system actions</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <div className="text-sm text-muted-foreground">
            {totalElements.toLocaleString()} {totalElements === 1 ? 'entry' : 'entries'}
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          {loading ? (
            <LoadingSpinner />
          ) : logs.length === 0 ? (
            <EmptyState
              message="No activity yet"
              description="Actions like record creation and transfers will appear here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const isSystem = !log.userId;
                  return (
                    <TableRow key={log.id}>
                      <TableCell
                        className="text-xs text-muted-foreground whitespace-nowrap"
                        title={new Date(log.createdAt).toLocaleString()}
                      >
                        {relativeTime(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        {isSystem ? (
                          <span className="font-medium text-muted-foreground">System</span>
                        ) : (
                          <>
                            <div className="font-medium">{log.userEmail}</div>
                            <div className="text-xs text-muted-foreground">ID: {log.userId}</div>
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`font-mono text-xs uppercase tracking-wider ${actionClasses(log.action)}`}
                        >
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <TargetCell log={log} />
                      </TableCell>
                      <TableCell
                        className="text-xs text-muted-foreground max-w-[300px] truncate"
                        title={log.details}
                      >
                        {log.details || <span className="text-muted-foreground/50">&mdash;</span>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {!loading && logs.length > 0 && (
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
