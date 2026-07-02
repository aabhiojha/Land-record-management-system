import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/authApi';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  MALPOT_OFFICER: 'Malpot Officer',
  CITIZEN: 'Citizen',
};

export function MainLayout() {
  const { fullName, role, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore errors during logout
    } finally {
      logout();
      navigate('/login');
    }
  };

  const navLinks = getNavLinks(role);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-[#20344c] text-white">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <div>
            <div className="text-base font-semibold">Land Records Management System</div>
            <div className="text-xs text-white/60">Department of Land Management, Nepal</div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <div>{fullName}</div>
              <div className="text-xs text-white/60">{role ? roleLabels[role] : ''}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="border-b border-border bg-card md:w-52 md:shrink-0 md:border-r md:border-b-0">
          <nav className="flex flex-row flex-wrap p-2 md:flex-col" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded px-3 py-2 text-sm ${
                    isActive
                      ? 'bg-primary/10 font-semibold text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 bg-background">
          <div className="mx-auto max-w-5xl p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
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
    links.push({ to: '/users', label: 'Users' });
    links.push({ to: '/audit', label: 'Audit Trail' });
  }

  links.push({ to: '/verification', label: 'Verification' });

  return links;
}
