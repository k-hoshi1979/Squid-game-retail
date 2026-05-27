import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

type ActionItem = {
  label: string;
  href: string;
  disabled?: boolean;
};

const jerseyActions: ActionItem[] = [
  { label: "貸出", href: "/jerseys/rent" },
  { label: "返却", href: "/jerseys/return" },
  { label: "在庫", href: "/jerseys/inventory" },
];

const ibActions: ActionItem[] = [
  { label: "購入", href: "/ib-tickets/add" },
  { label: "修正", href: "/ib-tickets/edit" },
];

function ActionButton({ item }: { item: ActionItem }) {
  const className =
    "block w-full text-center px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors " +
    (item.disabled
      ? "border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--muted)] cursor-not-allowed opacity-60"
      : "border-[var(--primary)] text-[var(--primary)] hover:bg-blue-50 dark:hover:bg-blue-900/20");

  if (item.disabled) {
    return (
      <span className={className} title="フェーズ3で実装予定">
        {item.label}
      </span>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {item.label}
    </Link>
  );
}

export function ActionSidebar() {
  return (
    <aside className="w-full md:w-44 shrink-0 bg-[var(--card)] border-b md:border-b-0 md:border-r border-[var(--border)] p-4 space-y-5">
      <div>
        <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          ジャージレンタル
        </p>
        <div className="space-y-2">
          {jerseyActions.map((item) => (
            <ActionButton key={item.label} item={item} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          IBチケット
        </p>
        <div className="space-y-2">
          {ibActions.map((item) => (
            <ActionButton key={item.label} item={item} />
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-[var(--border)] space-y-2">
        <Link
          href="/jerseys/detail"
          className="block w-full text-center px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
        >
          ジャージ詳細
        </Link>
        <Link
          href="/logs"
          className="block w-full text-center px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
        >
          操作ログ
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}
