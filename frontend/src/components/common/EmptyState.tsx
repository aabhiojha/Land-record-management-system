interface EmptyStateProps {
  message: string;
  description?: string;
}

export function EmptyState({ message, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-lg font-medium text-muted-foreground">{message}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground/70">{description}</p>}
    </div>
  );
}
