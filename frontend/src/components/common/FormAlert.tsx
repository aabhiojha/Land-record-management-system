import { CircleAlert } from 'lucide-react';

export function FormAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-sm border-l-[3px] border-destructive bg-destructive/10 p-3 text-sm text-destructive"
    >
      <CircleAlert size={16} strokeWidth={2} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
