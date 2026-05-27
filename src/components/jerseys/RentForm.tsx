"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rentJerseyAction } from "@/app/(app)/jerseys/actions";
import type { JerseyGroupInventory } from "@/lib/retail/jerseyInventoryTypes";
import { SIZES } from "@/lib/retail/jerseyUtils";
import type { JerseyRentalType, JerseySize } from "@/types/database";

const HOURS = Array.from({ length: 11 }, (_, i) => i + 10);
const MINUTES = [0, 10, 20, 30, 40, 50];

type Props = {
  groups: JerseyGroupInventory[];
};

export function RentForm({ groups }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [groupCode, setGroupCode] = useState<string>("");
  const [itemId, setItemId] = useState<string>("");
  const [size, setSize] = useState<JerseySize | "">("");
  const [rentalType, setRentalType] = useState<JerseyRentalType | "">("");
  const [hour, setHour] = useState<number>(10);
  const [minute, setMinute] = useState<number>(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedGroup = useMemo(
    () => groups.find((g) => g.code === groupCode),
    [groups, groupCode],
  );

  const selectedItem = useMemo(
    () => selectedGroup?.items.find((i) => i.id === itemId),
    [selectedGroup, itemId],
  );

  const availableQty = size && selectedItem ? selectedItem.sizes[size].quantity : 0;

  const summary = selectedItem && size && rentalType
    ? `${groupCode} / ${selectedItem.label} / ${size} / ${rentalType === "normal" ? "通常" : "SNS"} / ${hour}:${String(minute).padStart(2, "0")}`
    : "";

  function validate(): string | null {
    if (!groupCode) return "グループを選択してください";
    if (!itemId) return "ジャージ番号を選択してください";
    if (!size) return "サイズを選択してください";
    if (!rentalType) return "種類を選択してください";
    if (availableQty <= 0) return "在庫がありません";
    return null;
  }

  function handleConfirmClick() {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setShowConfirm(true);
  }

  function handleRent() {
    const err = validate();
    if (err || !size || !rentalType) return;

    startTransition(async () => {
      const result = await rentJerseyAction({
        jerseyItemId: itemId,
        size,
        rentalType,
        hour,
        minute,
      });
      if (result.error) {
        setError(result.error);
        setShowConfirm(false);
        return;
      }
      router.push(`/dashboard?rented=${encodeURIComponent(result.orderNumber ?? "")}`);
      router.refresh();
    });
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-[var(--foreground)]">グループ</legend>
        <div className="flex gap-2">
          {groups.map((g) => (
            <button
              key={g.code}
              type="button"
              onClick={() => {
                setGroupCode(g.code);
                setItemId("");
                setSize("");
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition-colors ${
                groupCode === g.code
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              {g.code}
            </button>
          ))}
        </div>
      </fieldset>

      {selectedGroup && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-[var(--foreground)]">ジャージ番号</legend>
          <div className="grid grid-cols-2 gap-2">
            {selectedGroup.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setItemId(item.id);
                  setSize("");
                }}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  itemId === item.id
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {selectedItem && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-[var(--foreground)]">サイズ</legend>
          <div className="flex gap-2">
            {SIZES.map((s) => {
              const qty = selectedItem.sizes[s].quantity;
              const disabled = qty <= 0;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSize(s)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition-colors ${
                    disabled
                      ? "border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--muted)] opacity-50 cursor-not-allowed"
                      : size === s
                        ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                        : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
                  }`}
                >
                  {s}
                  <span className="block text-xs font-normal opacity-80">在庫{qty}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-[var(--foreground)]">種類</legend>
        <div className="flex gap-2">
          {(["normal", "sns"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setRentalType(t)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                rentalType === t
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              {t === "normal" ? "通常 ¥1,500" : "SNS ¥1,000"}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-[var(--foreground)]">セッション開始時間</legend>
        <div className="flex gap-3 items-center">
          <label className="flex-1">
            <span className="text-xs text-[var(--muted-foreground)]">時</span>
            <select
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--background)]"
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>{h}時</option>
              ))}
            </select>
          </label>
          <label className="flex-1">
            <span className="text-xs text-[var(--muted-foreground)]">分</span>
            <select
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--background)]"
            >
              {MINUTES.map((m) => (
                <option key={m} value={m}>{String(m).padStart(2, "0")}分</option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      <button
        type="button"
        onClick={handleConfirmClick}
        disabled={pending}
        className="w-full py-3 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
      >
        確認する
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-sm bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-lg p-6 space-y-4">
            <p className="text-sm font-medium text-[var(--foreground)]">この内容でよろしいですか？</p>
            <p className="text-sm text-[var(--muted-foreground)] break-all">{summary}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={pending}
                className="flex-1 py-2.5 border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-[var(--muted)]"
              >
                いいえ
              </button>
              <button
                type="button"
                onClick={handleRent}
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
