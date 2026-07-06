import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { auditApi } from '@/api/auditApi';
import type { AuditLog } from '@/api/auditApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PaginationControls } from '@/components/common/PaginationControls';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import {
  actionClasses,
  actionLabel,
  actorName,
  entityTypeLabel,
  relativeTime,
  roleLabel,
  targetLabel,
} from '@/lib/auditFormat';

// The acting user: their name and role, or a "System" marker for automated entries.
function ActorCell({ log }: { log: AuditLog }) {
  if (log.system) {
    return <span className="font-medium text-muted-foreground">System</span>;
  }
  return (
    <div className="min-w-0">
      <div className="truncate font-medium">{actorName(log)}</div>
      {log.userRole && (
        <div className="text-xs text-muted-foreground">{roleLabel(log.userRole)}</div>
      )}
    </div>
  );
}

// The target of the action, shown by human-readable reference (never a raw id).
// Links to the record's detail page when we know which record it belongs to.
function TargetCell({ log }: { log: AuditLog }) {
  const label = targetLabel(log);
  const kind = entityTypeLabel(log.entityType);
  const showKind = log.entityLabel != null && kind !== label;

  const body = (
    <>
      <span>{label}</span>
      {showKind && <span className="ml-1.5 text-xs text-muted-foreground">{kind}</span>}
    </>
  );

  if (log.landRecordId != null) {
    return (
      <Link to={`/land-records/${log.landRecordId}`} className="text-primary hover:underline">
        {body}
      </Link>
    );
  }
  return <span>{body}</span>;
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
    auditApi.getLogs(page, 15)
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
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Audit Trail</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          An immutable record of every action taken across the system.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Activity Log</CardTitle>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[140px]">When</TableHead>
                    <TableHead className="w-[180px]">Performed by</TableHead>
                    <TableHead className="w-[150px]">Action</TableHead>
                    <TableHead className="w-[200px]">Target</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="align-top">
                      <TableCell
                        className="whitespace-nowrap text-xs text-muted-foreground"
                        title={new Date(log.createdAt).toLocaleString()}
                      >
                        {relativeTime(log.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        <ActorCell log={log} />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${actionClasses(log.action)}`}
                        >
                          {actionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <TargetCell log={log} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.details || <span className="text-muted-foreground/50">&mdash;</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
