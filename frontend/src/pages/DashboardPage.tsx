import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { dashboardApi } from '@/api/dashboardApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

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
    </div>
  );
}

// Crimson for official counts, navy for informational, gold sparingly.
const accentBorders = [
  'border-l-primary',
  'border-l-civic',
  'border-l-gold',
  'border-l-success',
];

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
