"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateInventoryAction } from "@/app/(app)/jerseys/actions";
import type { JerseyGroupInventory } from "@/lib/retail/jerseyInventoryTypes";
import { SIZES } from "@/lib/retail/jerseyUtils";
import type { JerseySize } from "@/types/database";

type Props = {
  groups: JerseyGroupInventory[];
};

type CellKey = `${string}::${JerseySize}`;

function cellKey(itemId: string, size: JerseySize): CellKey {
  return `${itemId}::${size}`;
}

function parseCellKey(key: CellKey): { itemId: string; size: JerseySize } {
  const idx = key.lastIndexOf("::");
  return {
    itemId: key.slice(0, idx),
    size: key.slice(idx + 2) as JerseySize,
  };
}

export function InventoryForm({ groups }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const initial = useMemo(() => {
    const map = new Map<CellKey, number>();
    for (const g of groups) {
      for (const item of g.items) {
        for (const s of SIZES) {
          map.set(cellKey(item.id, s), item.sizes[s].quantity);
        }
      }
    }
    return map;
  }, [groups]);

  const [quantities, setQuantities] = useState<Map<CellKey, number>>(initial);
  const [dirty, setDirty] = useState(false);

  const isDirty = useMemo(() => {
    for (const [key, val] of initial) {
      if (quantities.get(key) !== val) return true;
    }
    return false;
  }, [initial, quantities]);

  useEffect(() => {
    setDirty(isDirty);
  }, [isDirty]);

  const warnLeave = useCallback(
    (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    },
    [dirty],
  );

  useEffect(() => {
    window.addEventListener("beforeunload", warnLeave);
    return () => window.removeEventListener("beforeunload", warnLeave);
  }, [warnLeave]);

  function setQty(itemId: string, size: JerseySize, value: number) {
    if (value < 0) {
      setError("在庫数は0以上で入力してください");
      return;
    }
    setError(null);
    setQuantities((prev) => {
      const next = new Map(prev);
      next.set(cellKey(itemId, size), value);
      return next;
    });
  }

  function handleClose() {
    if (dirty && !window.confirm("入力は登録されていません。ダッシュボードに戻りますか？")) {
      return;
    }
    router.push("/dashboard");
  }

  function handleSubmit() {
    const updates: { jerseyItemId: string; size: JerseySize; quantity: number }[] = [];
    for (const [key, val] of quantities) {
      const orig = initial.get(key);
      if (orig === val) continue;
      if (val < 0) {
        setError("在庫数は0以上で入力してください");
        return;
      }
      const { itemId, size } = parseCellKey(key);
      updates.push({ jerseyItemId: itemId, size, quantity: val });
    }

    if (updates.length === 0) {
      setError("変更がありません");
      return;
    }

    startTransition(async () => {
      const result = await updateInventoryAction(updates);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      setError(null);
      router.refresh();
      setTimeout(() => router.push("/dashboard"), 800);
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
          在庫を登録しました
        </div>
      )}

      <p className="text-sm text-[var(--muted-foreground)]">在庫を設定してください</p>

      {groups.map((group) => (
        <section key={group.code} className="space-y-3">
          <h2 className="text-sm font-bold text-[var(--foreground)]">グループ {group.code}</h2>
          {group.items.map((item) => (
            <div
              key={item.id}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4"
            >
              <p className="text-sm font-semibold mb-3">{item.label}</p>
              <div className="grid grid-cols-3 gap-3">
                {SIZES.map((size) => {
                  const key = cellKey(item.id, size);
                  const qty = quantities.get(key) ?? 0;
                  return (
                    <div key={size} className="text-center">
                      <p className="text-xs text-[var(--muted-foreground)] mb-1">{size}</p>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={qty}
                        onChange={(e) => setQty(item.id, size, Number(e.target.value))}
                        className="w-full px-2 py-2 border border-[var(--border)] rounded-lg text-center text-lg font-bold bg-[var(--background)]"
                      />
                      <div className="flex flex-wrap justify-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setQty(item.id, size, n)}
                            className="w-7 h-7 text-xs rounded border border-[var(--border)] hover:bg-[var(--muted)]"
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ))}

      <div className="flex gap-3 sticky bottom-0 py-3 bg-[var(--background)]">
        <button
          type="button"
          onClick={handleClose}
          className="flex-1 py-2.5 border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-[var(--muted)]"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending}
          className="flex-1 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
        >
          {pending ? "登録中…" : "登録"}
        </button>
      </div>
    </div>
  );
}
