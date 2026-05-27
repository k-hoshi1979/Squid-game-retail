import type { JerseySize } from "@/types/database";
import { SIZES } from "@/lib/retail/jerseyUtils";

export type JerseySizeInfo = {
  quantity: number;
  usesSinceClean: number;
  totalUses: number;
  lastCleanedAt: string | null;
};

export type JerseySizeMap = Record<JerseySize, JerseySizeInfo>;

export type JerseyItemInventory = {
  id: string;
  label: string;
  sortOrder: number;
  sizes: JerseySizeMap;
};

export type JerseyGroupInventory = {
  code: string;
  sortOrder: number;
  items: JerseyItemInventory[];
};

export type JerseyUsageRow = {
  jerseyItemId: string;
  groupCode: string;
  itemLabel: string;
  size: JerseySize;
  quantity: number;
  usesSinceClean: number;
  totalUses: number;
  lastCleanedAt: string | null;
};

export function emptySizeInfo(): JerseySizeInfo {
  return { quantity: 0, usesSinceClean: 0, totalUses: 0, lastCleanedAt: null };
}

export function emptySizes(): JerseySizeMap {
  return { S: emptySizeInfo(), M: emptySizeInfo(), L: emptySizeInfo() };
}

export function flattenJerseyUsage(groups: JerseyGroupInventory[]): JerseyUsageRow[] {
  const rows: JerseyUsageRow[] = [];
  for (const g of groups) {
    for (const item of g.items) {
      for (const size of SIZES) {
        const info = item.sizes[size];
        rows.push({
          jerseyItemId: item.id,
          groupCode: g.code,
          itemLabel: item.label,
          size,
          quantity: info.quantity,
          usesSinceClean: info.usesSinceClean,
          totalUses: info.totalUses,
          lastCleanedAt: info.lastCleanedAt,
        });
      }
    }
  }
  return rows;
}
