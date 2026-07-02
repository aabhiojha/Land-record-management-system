import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  INITIATED: 'bg-amber-50 text-amber-800 border-amber-200',
  OFFICER_VERIFIED: 'bg-blue-50 text-blue-800 border-blue-200',
  ADMIN_APPROVED: 'bg-green-50 text-green-800 border-green-200',
  REJECTED: 'bg-red-50 text-red-800 border-red-200',
  CANCELLED: 'bg-muted text-muted-foreground border-border',
  AABAD: 'bg-blue-50 text-blue-800 border-blue-200',
  KHET: 'bg-green-50 text-green-800 border-green-200',
  PAKHO: 'bg-amber-50 text-amber-800 border-amber-200',
  VERIFIED: 'bg-green-50 text-green-800 border-green-200',
  UNVERIFIED: 'bg-muted text-muted-foreground border-border',
  ACTIVE: 'bg-green-50 text-green-800 border-green-200',
  INACTIVE: 'bg-red-50 text-red-800 border-red-200',
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
      className={cn(statusStyles[status] || 'bg-muted text-muted-foreground border-border', className)}
    >
      {labels[status] || status}
    </Badge>
  );
}
