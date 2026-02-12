interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h1>
      {description && (
        <p className="text-slate-500 mt-1">{description}</p>
      )}
    </div>
  );
}
