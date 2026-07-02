import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import {
  ArrowRightLeft,
  Landmark,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  ScrollText,
  ShieldCheck,
  UsersRound,
  Activity,
  X,
} from 'lucide-react';
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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


      <div className="relative flex flex-1">
        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-30 bg-foreground/40 md:hidden"
            aria-hidden="true"
            onClick={() => setMobileNavOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-civic text-sidebar-foreground transition-transform duration-150 ease-in-out md:static md:translate-x-0 ${
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center gap-3 border-b border-sidebar-border p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground">
              <Landmark size={22} strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-widest text-sidebar-foreground/70 uppercase">
                Nepal Sarkar
              </p>
              <h1 className="truncate font-heading text-base font-bold text-white">
                Land Records
              </h1>
            </div>
            <button
              type="button"
              className="ml-auto inline-flex items-center gap-1 rounded-sm p-1.5 text-sidebar-foreground/80 hover:bg-white/10 hover:text-white md:hidden"
              onClick={() => setMobileNavOpen(false)}
            >
              <X size={18} aria-hidden="true" />
              <span className="text-xs font-medium">Close</span>
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-3" aria-label="Primary navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 border-l-[3px] px-3 py-2.5 text-[15px] font-medium transition-colors duration-150 ${
                      isActive
                        ? 'border-primary bg-white/10 text-white'
                        : 'border-transparent text-sidebar-foreground/75 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={2} aria-hidden="true" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-sidebar-border p-4">
            <div className="mb-3">
              <p className="truncate text-sm font-medium text-white">{fullName}</p>
              <p className="text-xs text-sidebar-foreground/70">
                {role ? roleLabels[role] : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-white/25 text-sm font-semibold text-white transition-colors duration-150 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
            >
              <LogOut size={16} aria-hidden="true" />
              Logout
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-background">
          <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-3 md:hidden">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu size={18} aria-hidden="true" />
              Menu
            </button>
            <span className="font-heading text-sm font-bold">Land Records</span>
          </div>
          <div className="mx-auto max-w-5xl p-4 sm:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function getNavLinks(role: string | null) {
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/land-records', label: 'Land Records', icon: Map },
  ];

  if (role === 'CITIZEN') {
    links.push({ to: '/my-records', label: 'My Records', icon: ScrollText });
    links.push({ to: '/transfers', label: 'Transfers', icon: ArrowRightLeft });
  }

  if (role === 'MALPOT_OFFICER') {
    links.push({ to: '/transfers', label: 'Transfers', icon: ArrowRightLeft });
  }

  if (role === 'SUPER_ADMIN') {
    links.push({ to: '/transfers', label: 'Transfers', icon: ArrowRightLeft });
    links.push({ to: '/users', label: 'User Management', icon: UsersRound });
    links.push({ to: '/audit', label: 'Audit Trail', icon: Activity });
  }

  links.push({ to: '/verification', label: 'Verification', icon: ShieldCheck });

  return links;
}
