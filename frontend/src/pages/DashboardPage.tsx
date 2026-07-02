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
import { actionClasses, relativeTime } from '@/lib/auditFormat';
import {
  FilePlus, ShieldCheck, ShieldAlert, ArrowLeftRight, Users, ScrollText, FileText, Activity,
  type LucideIcon,
} from 'lucide-react';

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
      <h1 className="text-2xl font-bold mb-2 sm:text-3xl">Welcome, {fullName}</h1>
      <p className="text-muted-foreground mb-2">
        {role === 'SUPER_ADMIN' && 'System Administration Dashboard'}
        {role === 'MALPOT_OFFICER' && 'Land Revenue Officer Dashboard'}
        {role === 'CITIZEN' && 'Citizen Dashboard'}
      </p>
      <div className="mb-8 h-[3px] w-12 bg-primary" aria-hidden="true" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <Card
            key={card.label}
            className={`border-l-[3px] transition-shadow duration-150 hover:shadow-hover ${accentBorders[index % accentBorders.length]}`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="font-sans text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-heading text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ChainIntegrityCard />

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {actions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="flex items-center gap-2 rounded-md border bg-card px-4 py-3 text-sm font-medium transition-shadow hover:shadow-hover"
            >
              <a.icon className="size-4 text-primary" />
              {a.label}
            </Link>
          ))}
        </div>
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
  const accent = loading || failed
    ? 'border-l-muted-foreground'
    : valid ? 'border-l-success' : 'border-l-destructive';

  return (
    <Card className={`mt-8 border-l-[3px] ${accent}`}>
      <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {loading ? (
            <ShieldCheck className="size-6 text-muted-foreground" />
          ) : valid ? (
            <ShieldCheck className="size-6 text-success" />
          ) : (
            <ShieldAlert className="size-6 text-destructive" />
          )}
          <div>
            <p className="font-semibold">
              {loading ? 'Checking ledger integrity…'
                : failed ? 'Integrity status unavailable'
                : valid ? 'Ledger Verified' : 'Integrity Violation Detected'}
            </p>
            <p className="text-sm text-muted-foreground">
              {loading ? 'Verifying the hash chain across all records.'
                : failed ? 'Could not reach the verification service.'
                : chain?.message}
            </p>
          </div>
        </div>
        {!loading && !failed && chain && (
          <div className="text-xs text-muted-foreground sm:text-right">
            <div>{chain.totalRecords.toLocaleString()} records</div>
            {rootHash && (
              <div className="font-mono" title={rootHash}>
                root {rootHash.slice(0, 12)}…
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
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
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-5 text-primary" /> Recent Activity
        </CardTitle>
        <Link to="/audit" className="text-sm text-primary hover:underline">View all</Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-4 text-sm text-muted-foreground">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="divide-y">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex min-w-0 items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`shrink-0 font-mono text-xs uppercase tracking-wider ${actionClasses(log.action)}`}
                  >
                    {log.action.replace(/_/g, ' ')}
                  </Badge>
                  <span className="truncate text-sm">
                    {log.entityType} <span className="text-muted-foreground">#{log.entityId}</span>
                    <span className="text-muted-foreground"> · {log.userId ? log.userEmail : 'System'}</span>
                  </span>
                </div>
                <span
                  className="shrink-0 text-xs text-muted-foreground"
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

// Crimson for official counts, navy for informational, gold sparingly.
const accentBorders = [
  'border-l-primary',
  'border-l-civic',
  'border-l-gold',
  'border-l-success',
];

interface QuickAction {
  label: string;
  to: string;
  icon: LucideIcon;
}

function getQuickActions(role: string | null): QuickAction[] {
  if (role === 'SUPER_ADMIN') {
    return [
      { label: 'Review Transfers', to: '/transfers', icon: ArrowLeftRight },
      { label: 'Manage Users', to: '/users', icon: Users },
      { label: 'Audit Trail', to: '/audit', icon: ScrollText },
    ];
  }
  if (role === 'MALPOT_OFFICER') {
    return [
      { label: 'New Record', to: '/land-records/new', icon: FilePlus },
      { label: 'Verify Records', to: '/verification', icon: ShieldCheck },
      { label: 'Transfers', to: '/transfers', icon: ArrowLeftRight },
    ];
  }
  return [
    { label: 'My Records', to: '/my-records', icon: FileText },
    { label: 'Initiate Transfer', to: '/transfers/new', icon: ArrowLeftRight },
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
