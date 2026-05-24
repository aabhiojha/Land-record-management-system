import { Link, Outlet, useNavigate } from 'react-router';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  MALPOT_OFFICER: 'Malpot Officer',
  CITIZEN: 'Citizen',
};

export function MainLayout() {
  const { fullName, role, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = getNavLinks(role);

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-lg font-semibold">Land Records</h1>
          <p className="text-sm text-muted-foreground">Nepal Digital System</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="mb-3">
            <p className="text-sm font-medium truncate">{fullName}</p>
            <p className="text-xs text-muted-foreground">
              {role ? roleLabels[role] : ''}
            </p>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 bg-muted/20">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function getNavLinks(role: string | null) {
  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/land-records', label: 'Land Records' },
  ];

  if (role === 'CITIZEN') {
    links.push({ to: '/my-records', label: 'My Records' });
    links.push({ to: '/transfers', label: 'Transfers' });
  }

  if (role === 'MALPOT_OFFICER') {
    links.push({ to: '/transfers', label: 'Transfers' });
  }

  if (role === 'SUPER_ADMIN') {
    links.push({ to: '/transfers', label: 'Transfers' });
    links.push({ to: '/users', label: 'User Management' });
  }

  links.push({ to: '/verification', label: 'Verification' });

  return links;
}
