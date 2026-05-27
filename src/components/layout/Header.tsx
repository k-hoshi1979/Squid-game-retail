interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <div className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-[var(--border)] bg-[var(--card)]">
      <div>
        <h1 className="text-base sm:text-lg font-semibold text-[var(--foreground)]">{title}</h1>
        {description && (
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">{description}</p>
        )}
      </div>
    </div>
  );
}
