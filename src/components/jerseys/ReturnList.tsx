"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { returnJerseyAction } from "@/app/(app)/jerseys/actions";
import type { UnreturnedRental } from "@/lib/retail/jerseys";
import { formatTimeJst, rentalTypeLabel } from "@/lib/retail/jerseyUtils";

type Props = {
  rentals: UnreturnedRental[];
};

export function ReturnList({ rentals }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<UnreturnedRental | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleReturn() {
    if (!selected) return;
    startTransition(async () => {
      const result = await returnJerseyAction(selected.id);
      if (result.error) {
        setError(result.error);
        setSelected(null);
        return;
      }
      setSelected(null);
      router.refresh();
    });
  }

  if (rentals.length === 0) {
    return (
      <p className="text-center text-sm text-[var(--muted-foreground)] py-12">
        未返却のジャージはありません
      </p>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-3">
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      <ul className="divide-y divide-[var(--border)] bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        {rentals.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => setSelected(r)}
              className="w-full text-left px-4 py-3 hover:bg-[var(--muted)] transition-colors"
            >
              <p className="text-sm font-medium text-[var(--foreground)]">{r.orderNumber}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                貸出 {formatTimeJst(r.rentedAt)} · セッション {formatTimeJst(r.sessionStartAt)}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {r.groupCode}-{r.itemLabel} / {r.size} / {rentalTypeLabel(r.rentalType)}
              </p>
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-sm bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-lg p-6 space-y-4">
            <p className="text-sm font-medium text-[var(--foreground)]">返却処理しますか？</p>
            <div className="text-xs text-[var(--muted-foreground)] space-y-1">
              <p>注文ID: {selected.orderNumber}</p>
              <p>貸出時間: {formatTimeJst(selected.rentedAt)}</p>
              <p>セッション: {formatTimeJst(selected.sessionStartAt)}</p>
              <p>
                ジャージ: {selected.groupCode}-{selected.itemLabel} / {selected.size} /{" "}
                {rentalTypeLabel(selected.rentalType)}
              </p>
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
                onClick={handleReturn}
                disabled={pending}
                className="flex-1 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
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
