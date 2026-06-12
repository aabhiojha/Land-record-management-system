import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Civic palette: gold for pending notices, navy for in-process,
// forest green for approved, crimson for rejected. Text labels always
// accompany color so state is never conveyed by color alone.
const statusStyles: Record<string, string> = {
  INITIATED: 'bg-notice text-gold border-notice-border',
  OFFICER_VERIFIED: 'bg-civic/10 text-civic border-civic/25',
  ADMIN_APPROVED: 'bg-success/10 text-success border-success/25',
  REJECTED: 'bg-destructive/10 text-destructive border-destructive/25',
  CANCELLED: 'bg-muted text-muted-foreground border-border',
  AABAD: 'bg-civic/10 text-civic border-civic/25',
  KHET: 'bg-success/10 text-success border-success/25',
  PAKHO: 'bg-notice text-gold border-notice-border',
  VERIFIED: 'bg-success/10 text-success border-success/25',
  UNVERIFIED: 'bg-muted text-muted-foreground border-border',
  ACTIVE: 'bg-success/10 text-success border-success/25',
  INACTIVE: 'bg-destructive/10 text-destructive border-destructive/25',
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
