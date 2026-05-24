import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  INITIATED: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  OFFICER_VERIFIED: 'bg-blue-100 text-blue-800 border-blue-300',
  ADMIN_APPROVED: 'bg-green-100 text-green-800 border-green-300',
  REJECTED: 'bg-red-100 text-red-800 border-red-300',
  CANCELLED: 'bg-gray-100 text-gray-800 border-gray-300',
  AABAD: 'bg-purple-100 text-purple-800 border-purple-300',
  KHET: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  PAKHO: 'bg-amber-100 text-amber-800 border-amber-300',
  VERIFIED: 'bg-green-100 text-green-800 border-green-300',
  UNVERIFIED: 'bg-gray-100 text-gray-600 border-gray-300',
  ACTIVE: 'bg-green-100 text-green-800 border-green-300',
  INACTIVE: 'bg-red-100 text-red-800 border-red-300',
};

const labels: Record<string, string> = {
  INITIATED: 'Initiated',
  OFFICER_VERIFIED: 'Officer Verified',
  ADMIN_APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  AABAD: 'Aabad',
  KHET: 'Khet',
  PAKHO: 'Pakho',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusStyles[status] || 'bg-gray-100 text-gray-800', className)}
    >
      {labels[status] || status}
    </Badge>
  );
}
