import { Outlet } from 'react-router';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
