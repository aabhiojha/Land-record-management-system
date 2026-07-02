import { Outlet } from 'react-router';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-lg font-semibold">Land Records Management System</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Department of Land Management, Nepal
            </p>
          </div>

          <div className="rounded-md border border-border bg-card">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
