"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markJerseyCleanedAction } from "@/app/(app)/jerseys/actions";
import {
  countNeedsCleaning,
  formatJerseyLabel,
  JERSEY_CLEANING_THRESHOLD,
  needsCleaning,
  sortByTotalUses,
} from "@/lib/retail/jerseyCleaning";
import {
  flattenJerseyUsage,
  type JerseyGroupInventory,
  type JerseyUsageRow,
} from "@/lib/retail/jerseyInventoryTypes";
import type { UnreturnedRental } from "@/lib/retail/jerseys";
import { formatTimeJst, rentalTypeLabel, SIZES } from "@/lib/retail/jerseyUtils";
import type { JerseySize } from "@/types/database";

type Props = {
  businessDateLabel: string;
  todayCount: number;
  groups: JerseyGroupInventory[];
  unreturned: UnreturnedRental[];
};

const RANK_STYLES = [
  "border-amber-400 bg-amber-50 dark:bg-amber-900/20",
  "border-slate-300 bg-slate-50 dark:bg-slate-800/40",
  "border-orange-300 bg-orange-50 dark:bg-orange-900/20",
] as const;

function rankLabel(rank: number): string {
  if (rank === 1) return "1位";
  if (rank === 2) return "2位";
  if (rank === 3) return "3位";
  return `${rank}位`;
}

function UsageTableRow({
  row,
  rank,
  isTopThree,
  onClean,
  pendingKey,
}: {
  row: JerseyUsageRow;
  rank: number;
  isTopThree: boolean;
  onClean: (jerseyItemId: string, size: JerseySize) => void;
  pendingKey: string | null;
}) {
  const key = `${row.jerseyItemId}::${row.size}`;
  const cleaning = needsCleaning(row.usesSinceClean);

  return (
    <tr
      className={
        isTopThree
          ? "bg-amber-50/60 dark:bg-amber-900/10"
          : undefined
      }
    >
      <td className="px-3 py-2.5 text-sm tabular-nums font-medium">{rankLabel(rank)}</td>
      <td className="px-3 py-2.5 text-sm">{formatJerseyLabel(row)}</td>
      <td className="px-3 py-2.5 text-sm text-right tabular-nums font-bold">{row.totalUses}</td>
      <td className="px-3 py-2.5 text-sm text-right tabular-nums">
        <span className={cleaning ? "text-amber-700 dark:text-amber-300 font-semibold" : undefined}>
          {row.usesSinceClean}
        </span>
        {cleaning && (
          <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            要クリーニング
          </span>
        )}
      </td>
      <td className="px-3 py-2.5 text-right">
        {row.usesSinceClean > 0 ? (
          <button
            type="button"
            disabled={pendingKey === key}
            onClick={() => onClean(row.jerseyItemId, row.size)}
            className="text-xs px-2.5 py-1 border border-[var(--border)] rounded-md hover:bg-[var(--muted)] disabled:opacity-50"
          >
            {pendingKey === key ? "処理中…" : "クリーニング済"}
          </button>
        ) : (
          <span className="text-xs text-[var(--muted-foreground)]">—</span>
        )}
      </td>
    </tr>
  );
}

export function JerseyDetailView({
  businessDateLabel,
  todayCount,
  groups,
  unreturned,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedUsage = useMemo(() => sortByTotalUses(flattenJerseyUsage(groups)), [groups]);
  const topThree = sortedUsage.slice(0, 3);
  const needsCleaningCount = useMemo(() => countNeedsCleaning(sortedUsage), [sortedUsage]);

  function handleClean(jerseyItemId: string, size: JerseySize) {
    const key = `${jerseyItemId}::${size}`;
    setPendingKey(key);
    setError(null);
    startTransition(async () => {
      const result = await markJerseyCleanedAction({ jerseyItemId, size });
      setPendingKey(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <p className="text-sm text-[var(--muted-foreground)]">Date：{businessDateLabel}</p>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center">
        <p className="text-xs text-[var(--muted-foreground)]">当日貸出数</p>
        <p className="text-4xl font-bold tabular-nums mt-1">{todayCount}</p>
      </section>

      {needsCleaningCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300">要クリーニング</span>
          <span className="text-xl font-bold text-amber-700 dark:text-amber-200 tabular-nums">
            {needsCleaningCount}着
          </span>
          <span className="text-xs text-amber-700/80 dark:text-amber-300/80 ml-auto">
            しきい値 {JERSEY_CLEANING_THRESHOLD} 回（全着共通）
          </span>
        </div>
      )}

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-bold text-[var(--foreground)]">通算使用回数 TOP 3（通期）</h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            累計貸出回数の多い順。通算はリセットされません。
          </p>
        </div>
        {topThree.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">まだ使用実績がありません</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topThree.map((row, i) => (
              <div
                key={`${row.jerseyItemId}-${row.size}`}
                className={`rounded-xl border-2 p-4 text-center ${RANK_STYLES[i] ?? RANK_STYLES[2]}`}
              >
                <p className="text-xs font-bold text-[var(--muted-foreground)]">{rankLabel(i + 1)}</p>
                <p className="text-sm font-semibold mt-1">{formatJerseyLabel(row)}</p>
                <p className="text-3xl font-bold tabular-nums mt-2">{row.totalUses}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">通算 {row.totalUses} 回</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-bold text-[var(--foreground)]">通算使用回数一覧（通期）</h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            全 {sortedUsage.length} 件 · TOP 3 は背景色で強調
          </p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-x-auto">
          <table className="w-full text-left min-w-[520px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)] text-xs text-[var(--muted-foreground)]">
                <th className="px-3 py-2 font-medium w-14">順位</th>
                <th className="px-3 py-2 font-medium">ジャージ</th>
                <th className="px-3 py-2 font-medium text-right">通算</th>
                <th className="px-3 py-2 font-medium text-right">洗濯後</th>
                <th className="px-3 py-2 font-medium text-right w-28">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {sortedUsage.map((row, i) => (
                <UsageTableRow
                  key={`${row.jerseyItemId}-${row.size}`}
                  row={row}
                  rank={i + 1}
                  isTopThree={i < 3}
                  onClean={handleClean}
                  pendingKey={pending ? pendingKey : null}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold text-[var(--foreground)]">在庫</h2>
        {groups.map((group) => (
          <div key={group.code} className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <h3 className="px-4 py-2 text-sm font-semibold bg-[var(--muted)] border-b border-[var(--border)]">
              グループ {group.code}
            </h3>
            <div className="divide-y divide-[var(--border)]">
              {group.items.map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-center gap-4">
                  <span className="text-sm font-medium w-12">{item.label}</span>
                  <div className="flex flex-1 justify-around">
                    {SIZES.map((s) => {
                      const info = item.sizes[s];
                      const cleaning = needsCleaning(info.usesSinceClean);
                      return (
                        <div key={s} className="text-center min-w-[4rem]">
                          <p className="text-xs text-[var(--muted-foreground)]">{s}</p>
                          <p className="text-lg font-bold tabular-nums">{info.quantity}</p>
                          {info.usesSinceClean > 0 && (
                            <p className={`text-[10px] tabular-nums ${cleaning ? "text-amber-700 dark:text-amber-300 font-semibold" : "text-[var(--muted-foreground)]"}`}>
                              洗濯後 {info.usesSinceClean}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[var(--foreground)]">未返却リスト</h2>
          <Link
            href="/jerseys/return"
            className="text-xs text-[var(--primary)] hover:underline"
          >
            返却処理へ
          </Link>
        </div>
        {unreturned.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">未返却はありません</p>
        ) : (
          <ul className="divide-y divide-[var(--border)] bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
            {unreturned.map((r) => (
              <li key={r.id} className="px-4 py-3 text-xs text-[var(--muted-foreground)]">
                <span className="font-medium text-[var(--foreground)]">{r.orderNumber}</span>
                {" · "}
                貸出 {formatTimeJst(r.rentedAt)} · セッション {formatTimeJst(r.sessionStartAt)}
                {" · "}
                {r.groupCode}-{r.itemLabel} / {r.size} / {rentalTypeLabel(r.rentalType)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
