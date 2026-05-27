import type { JerseyUsageRow } from "@/lib/retail/jerseyInventoryTypes";

/** クリーニング推奨しきい値（前回洗濯以降の使用回数・全着共通） */
export const JERSEY_CLEANING_THRESHOLD = 3;

export function needsCleaning(usesSinceClean: number): boolean {
  return usesSinceClean >= JERSEY_CLEANING_THRESHOLD;
}

function usageSortKey(row: JerseyUsageRow): string {
  return `${row.groupCode}-${row.itemLabel}-${row.size}`;
}

export function sortByTotalUses(rows: JerseyUsageRow[]): JerseyUsageRow[] {
  return [...rows].sort((a, b) => {
    if (b.totalUses !== a.totalUses) return b.totalUses - a.totalUses;
    return usageSortKey(a).localeCompare(usageSortKey(b), "ja");
  });
}

export function countNeedsCleaning(rows: JerseyUsageRow[]): number {
  return rows.filter((r) => needsCleaning(r.usesSinceClean)).length;
}

export function formatJerseyLabel(row: Pick<JerseyUsageRow, "groupCode" | "itemLabel" | "size">): string {
  return `${row.groupCode}-${row.itemLabel} / ${row.size}`;
}
