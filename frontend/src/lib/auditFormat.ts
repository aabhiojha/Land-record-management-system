// Shared formatting for audit log entries, used by the Audit Trail page and
// the dashboard's Recent Activity feed.

// Colour actions by intent so the log is easy to scan at a glance.
export function actionClasses(action: string): string {
  const a = action.toUpperCase();
  if (/(CREATE|APPROVE|VERIFY|REGISTER)/.test(a))
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (/(REJECT|DELETE|REVOKE|FAIL)/.test(a))
    return 'bg-red-50 text-red-700 border-red-200';
  if (/(TRANSFER|INITIATE)/.test(a))
    return 'bg-blue-50 text-blue-700 border-blue-200';
  if (/(LOGIN|LOGOUT|AUTH)/.test(a))
    return 'bg-muted text-muted-foreground border-border';
  return 'bg-primary/5 text-primary border-primary/20';
}

// Show "2 hours ago" for recent events, fall back to a plain date for old ones.
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 60) return 'just now';
  const mins = Math.round(diffSec / 60);
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString();
}
