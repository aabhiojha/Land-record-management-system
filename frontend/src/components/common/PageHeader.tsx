interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && <p className="text-muted-foreground mt-2">{description}</p>}
        <div className="mt-3 h-[3px] w-12 bg-primary" aria-hidden="true" />
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
