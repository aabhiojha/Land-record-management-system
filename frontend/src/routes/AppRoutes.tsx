import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useAuthStore } from '@/stores/authStore';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { AuthLayout } from '@/layouts/AuthLayout';
import { MainLayout } from '@/layouts/MainLayout';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { LandRecordsPage } from '@/pages/LandRecordsPage';
import { LandRecordDetailPage } from '@/pages/LandRecordDetailPage';
import { CreateLandRecordPage } from '@/pages/CreateLandRecordPage';
import { MyRecordsPage } from '@/pages/MyRecordsPage';
import { TransfersPage } from '@/pages/TransfersPage';
import { InitiateTransferPage } from '@/pages/InitiateTransferPage';
import { VerificationPage } from '@/pages/VerificationPage';
import { UserManagementPage } from '@/pages/UserManagementPage';

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <AuthRedirect>
              <AuthLayout />
            </AuthRedirect>
          }
        >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/land-records" element={<LandRecordsPage />} />
            <Route path="/land-records/:id" element={<LandRecordDetailPage />} />
            <Route path="/verification" element={<VerificationPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['MALPOT_OFFICER']} />}>
          <Route element={<MainLayout />}>
            <Route path="/land-records/new" element={<CreateLandRecordPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['CITIZEN']} />}>
          <Route element={<MainLayout />}>
            <Route path="/my-records" element={<MyRecordsPage />} />
            <Route path="/transfers/new" element={<InitiateTransferPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['CITIZEN', 'MALPOT_OFFICER', 'SUPER_ADMIN']} />}>
          <Route element={<MainLayout />}>
            <Route path="/transfers" element={<TransfersPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
          <Route element={<MainLayout />}>
            <Route path="/users" element={<UserManagementPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
