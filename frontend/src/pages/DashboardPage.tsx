import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuthStore } from '@/stores/authStore';
import { dashboardApi } from '@/api/dashboardApi';
import { auditApi } from '@/api/auditApi';
import type { AuditLog } from '@/api/auditApi';
import { verificationApi } from '@/api/verificationApi';
import type { ChainVerificationResult } from '@/types/verification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { actionClasses, actionLabel, activitySummary, actorName, relativeTime } from '@/lib/auditFormat';

export function DashboardPage() {
  const { fullName, role } = useAuthStore();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        let res;
        if (role === 'SUPER_ADMIN') res = await dashboardApi.getAdmin();
        else if (role === 'MALPOT_OFFICER') res = await dashboardApi.getOfficer();
        else res = await dashboardApi.getCitizen();
        setStats(res.data as Record<string, number>);
      } catch {
        /* empty */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [role]);

  if (loading) return <LoadingSpinner />;

  const statCards = getStatCards(role, stats);
  const actions = getQuickActions(role);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Logged in as {fullName}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-md border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">{card.label}</div>
            <div className="mt-1 text-2xl font-semibold">{card.value}</div>
          </div>
        ))}
      </div>

      <ChainIntegrityCard />

      <div className="mt-6 text-sm">
        {actions.map((a, i) => (
          <span key={a.to}>
            {i > 0 && <span className="mx-2 text-muted-foreground">·</span>}
            <Link to={a.to} className="text-primary hover:underline">
              {a.label}
            </Link>
          </span>
        ))}
      </div>

      {role === 'SUPER_ADMIN' && <RecentActivity />}
    </div>
  );
}

function ChainIntegrityCard() {
  const [chain, setChain] = useState<ChainVerificationResult | null>(null);
  const [rootHash, setRootHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([verificationApi.verifyChain(), verificationApi.getTreeRoot()])
      .then(([chainRes, rootRes]) => {
        if (!active) return;
        setChain(chainRes.data);
        setRootHash(rootRes.data.rootHash);
      })
      .catch(() => { if (active) setFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const valid = chain?.valid ?? false;

  return (
    <div className="mt-4 flex flex-col gap-2 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold">
          {loading ? 'Checking ledger integrity...'
            : failed ? 'Integrity status unavailable'
            : valid ? <span className="text-green-700">Ledger verified</span>
            : <span className="text-destructive">Integrity violation detected</span>}
        </p>
        <p className="text-sm text-muted-foreground">
          {loading ? 'Verifying the hash chain across all records.'
            : failed ? 'Could not reach the verification service.'
            : chain?.message}
        </p>
      </div>
      {!loading && !failed && chain && (
        <div className="text-xs text-muted-foreground sm:text-right">
          <div>{chain.totalRecords.toLocaleString()} records</div>
          {rootHash && (
            <div className="font-mono" title={rootHash}>
              root {rootHash.slice(0, 12)}...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RecentActivity() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    auditApi.getLogs(0, 6)
      .then((res) => { if (active) setLogs(res.data.content); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Link to="/audit" className="text-sm text-primary hover:underline">View all</Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-4 text-sm text-muted-foreground">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="divide-y">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-3 py-3">
                <div className="flex min-w-0 items-start gap-3">
                  <Badge
                    variant="outline"
                    className={`mt-0.5 shrink-0 text-xs font-medium ${actionClasses(log.action)}`}
                  >
                    {actionLabel(log.action)}
                  </Badge>
                  <div className="min-w-0">
                    <p className="truncate text-sm">{activitySummary(log)}</p>
                    <p className="text-xs text-muted-foreground">by {actorName(log)}</p>
                  </div>
                </div>
                <span
                  className="shrink-0 whitespace-nowrap text-xs text-muted-foreground"
                  title={new Date(log.createdAt).toLocaleString()}
                >
                  {relativeTime(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface QuickAction {
  label: string;
  to: string;
}

function getQuickActions(role: string | null): QuickAction[] {
  if (role === 'SUPER_ADMIN') {
    return [
      { label: 'Register a new record', to: '/land-records/new' },
      { label: 'Review pending transfers', to: '/transfers' },
      { label: 'Manage users', to: '/users' },
      { label: 'Audit trail', to: '/audit' },
    ];
  }
  if (role === 'MALPOT_OFFICER') {
    return [
      { label: 'Verify records', to: '/verification' },
      { label: 'Pending transfers', to: '/transfers' },
    ];
  }
  return [
    { label: 'View my records', to: '/my-records' },
    { label: 'Start a transfer', to: '/transfers/new' },
  ];
}

function getStatCards(role: string | null, stats: Record<string, number>) {
  if (role === 'SUPER_ADMIN') {
    return [
      { label: 'Total Records', value: stats.totalRecords ?? 0 },
      { label: 'Pending Approvals', value: stats.pendingApprovals ?? 0 },
      { label: 'Total Users', value: stats.totalUsers ?? 0 },
      { label: 'Total Transfers', value: stats.totalTransfers ?? 0 },
    ];
  }
  if (role === 'MALPOT_OFFICER') {
    return [
      { label: 'Total Records', value: stats.totalRecords ?? 0 },
      { label: 'Pending Verifications', value: stats.pendingVerifications ?? 0 },
      { label: 'Total Transfers', value: stats.totalTransfers ?? 0 },
    ];
  }
  return [
    { label: 'My Records', value: stats.myRecords ?? 0 },
    { label: 'My Transfers', value: stats.myTransfers ?? 0 },
  ];
}
