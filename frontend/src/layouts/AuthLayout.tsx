import { Outlet } from 'react-router';
import { Landmark } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="dhaka-stripe" aria-hidden="true" />

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-sm bg-primary text-primary-foreground">
              <Landmark size={26} strokeWidth={2} aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Government of Nepal
            </p>
            <h1 className="mt-1 text-xl font-bold">
              Land Records Management System
            </h1>
          </div>

          {/* Official double-border frame: signals a formal document. */}
          <div className="rounded-lg border border-input bg-card p-[3px] shadow-card">
            <div className="rounded-[5px] border-2 border-input">
              <Outlet />
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Ministry of Land Management &middot; Land Records Department
          </p>
        </div>
      </div>
    </div>
  );
}
