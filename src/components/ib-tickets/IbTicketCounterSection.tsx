"use client";

import type { IbTicketFieldDef } from "@/lib/retail/ibTicketTypes";

function Counter({
  label,
  value,
  onDec,
  onInc,
  unitPrice,
  disabled,
}: {
  label: string;
  value: number;
  onDec: () => void;
  onInc: () => void;
  unitPrice: number;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-1">
      <p className="text-xs text-[var(--muted-foreground)] text-center leading-tight">{label}</p>
      <p className="text-[10px] text-[var(--muted-foreground)]">¥{unitPrice.toLocaleString()}</p>
      <button
        type="button"
        onClick={onDec}
        disabled={disabled || value <= 0}
        className="w-8 h-8 rounded-full border border-[var(--border)] text-lg leading-none hover:bg-[var(--muted)] disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label={`${label}を減らす`}
      >
        −
      </button>
      <p className="text-2xl font-bold tabular-nums w-10 text-center">{value}</p>
      <button
        type="button"
        onClick={onInc}
        disabled={disabled}
        className="w-8 h-8 rounded-full border border-[var(--border)] text-lg leading-none hover:bg-[var(--muted)] disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label={`${label}を増やす`}
      >
        ＋
      </button>
    </div>
  );
}

type Props = {
  title: string;
  fields: IbTicketFieldDef[];
  values: Record<string, number>;
  onChange: (ticketType: string, value: number) => void;
  active?: boolean;
  inactiveHint?: string;
};

export function IbTicketCounterSection({
  title,
  fields,
  values,
  onChange,
  active = true,
  inactiveHint,
}: Props) {
  return (
    <section
      className={`bg-[var(--card)] border rounded-xl overflow-hidden transition-opacity ${
        active ? "border-[var(--primary)] ring-1 ring-[var(--primary)]/20" : "border-[var(--border)] opacity-70"
      }`}
    >
      <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--muted)] flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-[var(--foreground)]">{title}</h2>
        {active && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)] text-white font-medium">
            本日
          </span>
        )}
        {!active && inactiveHint && (
          <span className="text-xs text-[var(--muted-foreground)]">{inactiveHint}</span>
        )}
      </div>
      <div
        className="grid divide-x divide-[var(--border)] py-3"
        style={{ gridTemplateColumns: `repeat(${fields.length}, minmax(0, 1fr))` }}
      >
        {fields.map((f) => (
          <Counter
            key={f.ticketType}
            label={f.label}
            value={values[f.ticketType] ?? 0}
            unitPrice={f.unitPrice}
            onDec={() => onChange(f.ticketType, Math.max(0, (values[f.ticketType] ?? 0) - 1))}
            onInc={() => onChange(f.ticketType, (values[f.ticketType] ?? 0) + 1)}
          />
        ))}
      </div>
    </section>
  );
}

/** 貸切VIP 単独セクション */
export function IbVipCounterSection({
  field,
  value,
  onChange,
}: {
  field: IbTicketFieldDef;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--muted)]">
        <h2 className="text-sm font-bold text-[var(--foreground)]">IBチケット — 貸切VIP</h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">平日・休日で料金同一</p>
      </div>
      <div className="flex justify-center py-4">
        <Counter
          label={field.label}
          value={value}
          unitPrice={field.unitPrice}
          onDec={() => onChange(Math.max(0, value - 1))}
          onInc={() => onChange(value + 1)}
        />
      </div>
    </section>
  );
}
