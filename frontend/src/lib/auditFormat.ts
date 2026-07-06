// Shared formatting for audit log entries, used by the Audit Trail page and
// the dashboard's Recent Activity feed.

import type { AuditLog } from '@/api/auditApi';

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

// Turn SCREAMING_SNAKE tokens into Title Case, e.g. "CREATE_RECORD" -> "Create Record".
function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const actionLabel = titleCase;
export const roleLabel = (role: string | null): string => (role ? titleCase(role) : '');

// Human name for an entity kind, e.g. "LandRecord" -> "Land Record".
export function entityTypeLabel(entityType: string): string {
  return entityType.replace(/([a-z])([A-Z])/g, '$1 $2');
}

// The person (or "System") behind an entry.
export function actorName(log: AuditLog): string {
  return log.system ? 'System' : log.userName || log.userEmail || 'Unknown';
}

// A readable reference to what was acted on: prefer the human label
// ("Kitta KTM-1"), fall back to just the entity kind.
export function targetLabel(log: AuditLog): string {
  return log.entityLabel || entityTypeLabel(log.entityType);
}

// A one-line, human-readable summary of an entry for the activity feed.
// Prefers the recorded detail text, otherwise composes actor + action + target.
export function activitySummary(log: AuditLog): string {
  if (log.details) return log.details;
  return `${actionLabel(log.action)} · ${targetLabel(log)}`;
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
