"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rollbackOperationAction } from "@/app/(app)/logs/actions";
import {
  actionLabel,
  describeLog,
  formatLogTime,
  type OperationLogRow,
} from "@/lib/retail/operationLogUtils";
import type { RetailLogAction } from "@/types/database";

type SortOrder = "asc" | "desc";
type ActionFilter = "all" | RetailLogAction;

type Props = {
  logs: OperationLogRow[];
  dateLabel: string;
};

const FILTER_OPTIONS: { value: ActionFilter; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "jersey_rent", label: "ジャージ貸出" },
  { value: "jersey_return", label: "ジャージ返却" },
  { value: "jersey_inventory_update", label: "在庫更新" },
  { value: "jersey_cleaned", label: "クリーニング" },
  { value: "ib_ticket_add", label: "IB追加" },
  { value: "ib_ticket_edit", label: "IB修正" },
  { value: "rollback", label: "巻き戻し" },
];

export function OperationLogList({ logs, dateLabel }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  const [selected, setSelected] = useState<OperationLogRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...logs];
    if (actionFilter !== "all") {
      list = list.filter((l) => l.action === actionFilter);
    }
    list.sort((a, b) => {
      const cmp = a.performedAt.localeCompare(b.performedAt);
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return list;
  }, [logs, actionFilter, sortOrder]);

  function canRollback(row: OperationLogRow): boolean {
    return row.rolledBackAt === null && row.action !== "rollback";
  }

  function handleRollback() {
    if (!selected) return;
    startTransition(async () => {
      const result = await rollbackOperationAction(selected.id);
      if (result.error) {
        setError(result.error);
        setSelected(null);
        return;
      }
      setSelected(null);
      setError(null);
      router.refresh();
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <p className="text-sm text-[var(--muted-foreground)]">Date：{dateLabel}</p>

      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-[var(--muted-foreground)]">時間</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="px-2 py-1.5 border border-[var(--border)] rounded-lg text-sm bg-[var(--background)]"
          >
            <option value="asc">昇順</option>
            <option value="desc">降順</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-[var(--muted-foreground)]">項目</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
            className="px-2 py-1.5 border border-[var(--border)] rounded-lg text-sm bg-[var(--background)]"
          >
            {FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-[var(--muted-foreground)] py-12">
          操作ログはありません
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border)] bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          {filtered.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                disabled={!canRollback(row)}
                onClick={() => canRollback(row) && setSelected(row)}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  canRollback(row) ? "hover:bg-[var(--muted)] cursor-pointer" : "opacity-50 cursor-default"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {actionLabel(row.action)}
                      {row.rolledBackAt && (
                        <span className="ml-2 text-xs text-[var(--muted-foreground)]">（巻き戻し済）</span>
                      )}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">
                      {describeLog(row)}
                    </p>
                  </div>
                  <time className="text-xs text-[var(--muted-foreground)] shrink-0 tabular-nums">
                    {formatLogTime(row.performedAt)}
                  </time>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-sm bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-lg p-6 space-y-4">
            <p className="text-sm font-medium text-[var(--foreground)]">この操作を巻き戻しますか？</p>
            <div className="text-xs text-[var(--muted-foreground)] space-y-1">
              <p>{actionLabel(selected.action)}</p>
              <p>{describeLog(selected)}</p>
              <p>{formatLogTime(selected.performedAt)}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                disabled={pending}
                className="flex-1 py-2.5 border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-[var(--muted)]"
              >
                いいえ
              </button>
              <button
                type="button"
                onClick={handleRollback}
                disabled={pending}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {pending ? "処理中…" : "はい"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
