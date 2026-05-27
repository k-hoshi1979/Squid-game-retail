function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center px-2 py-3">
      <p className="text-xs text-[var(--muted-foreground)] mb-1">{label}</p>
      <p className="text-2xl font-bold tabular-nums text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function StatRow({ title, cells }: { title: string; cells: { label: string; value: number }[] }) {
  return (
    <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <h2 className="px-4 py-2.5 text-sm font-bold text-[var(--foreground)] border-b border-[var(--border)] bg-[var(--muted)]">
        {title}
      </h2>
      <div
        className="grid divide-x divide-[var(--border)]"
        style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
      >
        {cells.map((cell) => (
          <StatCell key={cell.label} label={cell.label} value={cell.value} />
        ))}
      </div>
    </section>
  );
}

export type DashboardViewProps = {
  dateLabel: string;
  jerseyNormalCount: number;
  jerseySnsCount: number;
  jerseyTotalCount: number;
  unreturnedCount: number;
  needsCleaningCount: number;
  ibWeekday: {
    gen: number;
    child: number;
    genVip: number;
    childVip: number;
  };
  ibHoliday: {
    gen: number;
    child: number;
    genVip: number;
    childVip: number;
  };
  ibVipCount: number;
  recentLogCount: number;
};

export function DashboardView(props: DashboardViewProps) {
  return (
    <div className="flex-1 p-4 sm:p-6 space-y-4 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          Date：{props.dateLabel}
        </p>
        {props.unreturnedCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <span className="text-xs font-medium text-amber-800 dark:text-amber-300">未返却</span>
            <span className="text-lg font-bold text-amber-700 dark:text-amber-200 tabular-nums">
              {props.unreturnedCount}
            </span>
          </div>
        )}
        {props.needsCleaningCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <span className="text-xs font-medium text-orange-800 dark:text-orange-300">要クリーニング</span>
            <span className="text-lg font-bold text-orange-700 dark:text-orange-200 tabular-nums">
              {props.needsCleaningCount}
            </span>
          </div>
        )}
      </div>

      <StatRow
        title="ジャージレンタル — 貸出実績"
        cells={[
          { label: "通常", value: props.jerseyNormalCount },
          { label: "SNS", value: props.jerseySnsCount },
          { label: "合計", value: props.jerseyTotalCount },
        ]}
      />

      <StatRow
        title="IBチケット — 平日"
        cells={[
          { label: "一般", value: props.ibWeekday.gen },
          { label: "子供", value: props.ibWeekday.child },
          { label: "一般VIP", value: props.ibWeekday.genVip },
          { label: "子供VIP", value: props.ibWeekday.childVip },
        ]}
      />

      <StatRow
        title="IBチケット — 休日"
        cells={[
          { label: "一般", value: props.ibHoliday.gen },
          { label: "子供", value: props.ibHoliday.child },
          { label: "一般VIP", value: props.ibHoliday.genVip },
          { label: "子供VIP", value: props.ibHoliday.childVip },
        ]}
      />

      <StatRow
        title="IBチケット — 貸切VIP"
        cells={[{ label: "貸切VIP", value: props.ibVipCount }]}
      />

      <div className="text-xs text-[var(--muted-foreground)] pt-2">
        本日の操作ログ: {props.recentLogCount} 件
      </div>
    </div>
  );
}
