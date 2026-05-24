import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  MALPOT_OFFICER: 'Malpot Officer',
  CITIZEN: 'Citizen',
};

export function DashboardPage() {
  const { fullName, role, email } = useAuthStore();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {fullName}!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Role:</span>{' '}
            {role ? roleLabels[role] : ''}
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Email:</span> {email}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Full dashboard with stats will be available after land records and transfers are implemented.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
