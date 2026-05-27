"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addIbTicketsAction } from "@/app/(app)/ib-tickets/actions";
import {
  IbTicketCounterSection,
  IbVipCounterSection,
} from "@/components/ib-tickets/IbTicketCounterSection";
import {
  IB_HOLIDAY_FIELDS,
  IB_VIP_FIELD,
  IB_WEEKDAY_FIELDS,
} from "@/lib/retail/ibTicketTypes";
import type { DayKind } from "@/lib/retail/holiday";
import { dayKindLabel } from "@/lib/retail/holiday";
import type { IbTicketType } from "@/types/database";

type Props = {
  dateLabel: string;
  dayKind: DayKind;
};

function initDeltas(): Record<IbTicketType, number> {
  return {
    gen_weekday: 0,
    gen_holiday: 0,
    child_weekday: 0,
    child_holiday: 0,
    gen_vip_weekday: 0,
    gen_vip_holiday: 0,
    child_vip_weekday: 0,
    child_vip_holiday: 0,
    vip: 0,
  };
}

export function IbTicketAddForm({ dateLabel, dayKind }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deltas, setDeltas] = useState(initDeltas);
  const [error, setError] = useState<string | null>(null);

  const totalAdded = useMemo(
    () => Object.values(deltas).reduce((a, b) => a + b, 0),
    [deltas],
  );

  function setDelta(ticketType: IbTicketType, value: number) {
    setDeltas((prev) => ({ ...prev, [ticketType]: value }));
  }

  function handleClose() {
    if (totalAdded > 0 && !window.confirm("入力は登録されていません。ダッシュボードに戻りますか？")) {
      return;
    }
    router.push("/dashboard");
  }

  function handleSubmit() {
    const payload = (Object.entries(deltas) as [IbTicketType, number][])
      .filter(([, n]) => n > 0)
      .map(([ticketType, deltaCount]) => ({ ticketType, deltaCount }));

    startTransition(async () => {
      const result = await addIbTicketsAction(payload);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/dashboard?ibAdded=1");
      router.refresh();
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="text-sm text-[var(--muted-foreground)] space-y-1">
        <p>Date：{dateLabel}</p>
        <p>
          本日は<strong className="text-[var(--foreground)]">{dayKindLabel(dayKind)}</strong>
          （カレンダー自動判定）
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      <IbTicketCounterSection
        title="IBチケット — 平日"
        fields={IB_WEEKDAY_FIELDS}
        values={deltas}
        onChange={(t, v) => setDelta(t as IbTicketType, v)}
        active={dayKind === "weekday"}
        inactiveHint="本日は休日"
      />

      <IbTicketCounterSection
        title="IBチケット — 休日"
        fields={IB_HOLIDAY_FIELDS}
        values={deltas}
        onChange={(t, v) => setDelta(t as IbTicketType, v)}
        active={dayKind === "holiday"}
        inactiveHint="本日は平日"
      />

      <IbVipCounterSection
        field={IB_VIP_FIELD}
        value={deltas.vip}
        onChange={(v) => setDelta("vip", v)}
      />

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
          disabled={pending || totalAdded === 0}
          className="flex-1 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
        >
          {pending ? "登録中…" : `登録（+${totalAdded}枚）`}
        </button>
      </div>
    </div>
  );
}
