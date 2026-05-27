"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { editIbTicketsAction } from "@/app/(app)/ib-tickets/actions";
import {
  IbTicketCounterSection,
  IbVipCounterSection,
} from "@/components/ib-tickets/IbTicketCounterSection";
import {
  IB_HOLIDAY_FIELDS,
  IB_VIP_FIELD,
  IB_WEEKDAY_FIELDS,
  type IbTicketTotals,
} from "@/lib/retail/ibTicketTypes";
import type { IbTicketType } from "@/types/database";

type Props = {
  dateLabel: string;
  initialTotals: IbTicketTotals;
};

function totalsToDeltaMap(totals: IbTicketTotals): Record<IbTicketType, number> {
  return {
    gen_weekday: totals.gen_weekday_count,
    gen_holiday: totals.gen_holiday_count,
    child_weekday: totals.child_weekday_count,
    child_holiday: totals.child_holiday_count,
    gen_vip_weekday: totals.gen_vip_weekday_count,
    gen_vip_holiday: totals.gen_vip_holiday_count,
    child_vip_weekday: totals.child_vip_weekday_count,
    child_vip_holiday: totals.child_vip_holiday_count,
    vip: totals.vip_count,
  };
}

function mapToTotals(values: Record<IbTicketType, number>): IbTicketTotals {
  return {
    gen_weekday_count: values.gen_weekday,
    gen_holiday_count: values.gen_holiday,
    child_weekday_count: values.child_weekday,
    child_holiday_count: values.child_holiday,
    gen_vip_weekday_count: values.gen_vip_weekday,
    gen_vip_holiday_count: values.gen_vip_holiday,
    child_vip_weekday_count: values.child_vip_weekday,
    child_vip_holiday_count: values.child_vip_holiday,
    vip_count: values.vip,
  };
}

export function IbTicketEditForm({ dateLabel, initialTotals }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState(() => totalsToDeltaMap(initialTotals));
  const [error, setError] = useState<string | null>(null);

  const isDirty = useMemo(() => {
    const init = totalsToDeltaMap(initialTotals);
    return (Object.keys(init) as IbTicketType[]).some((k) => values[k] !== init[k]);
  }, [initialTotals, values]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  function setValue(ticketType: IbTicketType, v: number) {
    setValues((prev) => ({ ...prev, [ticketType]: Math.max(0, v) }));
  }

  function handleClose() {
    if (isDirty && !window.confirm("入力は登録されていません。ダッシュボードに戻りますか？")) {
      return;
    }
    router.push("/dashboard");
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = await editIbTicketsAction(mapToTotals(values));
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/dashboard?ibEdited=1");
      router.refresh();
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <p className="text-sm text-[var(--muted-foreground)]">
        {dateLabel} の合計値を修正
      </p>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      <IbTicketCounterSection
        title="IBチケット — 平日"
        fields={IB_WEEKDAY_FIELDS}
        values={values}
        onChange={(t, v) => setValue(t as IbTicketType, v)}
        active
      />

      <IbTicketCounterSection
        title="IBチケット — 休日"
        fields={IB_HOLIDAY_FIELDS}
        values={values}
        onChange={(t, v) => setValue(t as IbTicketType, v)}
        active
      />

      <IbVipCounterSection
        field={IB_VIP_FIELD}
        value={values.vip}
        onChange={(v) => setValue("vip", v)}
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
          disabled={pending || !isDirty}
          className="flex-1 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
        >
          {pending ? "登録中…" : "登録"}
        </button>
      </div>
    </div>
  );
}
