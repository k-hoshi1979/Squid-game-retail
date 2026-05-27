import Link from "next/link";

interface JerseyPageShellProps {
  title: string;
  children: React.ReactNode;
}

export function JerseyPageShell({ title, children }: JerseyPageShellProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--card)]">
        <h1 className="text-base font-semibold text-[var(--foreground)]">{title}</h1>
        <Link
          href="/dashboard"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          aria-label="ダッシュボードに戻る"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
    </div>
  );
}
