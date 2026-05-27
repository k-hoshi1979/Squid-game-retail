import type { RetailLogAction } from "@/types/database";

export type OperationLogRow = {
  id: string;
  businessDate: string;
  action: RetailLogAction;
  targetType: string;
  targetId: string | null;
  snapshot: Record<string, unknown>;
  performedAt: string;
  rolledBackAt: string | null;
  operatorName: string;
};

const ACTION_LABELS: Record<RetailLogAction, string> = {
  jersey_rent: "ジャージ貸出",
  jersey_return: "ジャージ返却",
  jersey_inventory_update: "在庫更新",
  jersey_cleaned: "ジャージクリーニング",
  ib_ticket_add: "IBチケット追加",
  ib_ticket_edit: "IBチケット修正",
  rollback: "巻き戻し",
};

export function actionLabel(action: RetailLogAction): string {
  return ACTION_LABELS[action] ?? action;
}

export function describeLog(row: OperationLogRow): string {
  const snap = row.snapshot;
  switch (row.action) {
    case "jersey_rent":
    case "jersey_return": {
      const g = snap.group_code as string | undefined;
      const l = snap.item_label as string | undefined;
      const rental = snap.rental as { order_number?: string; size?: string; rental_type?: string } | undefined;
      const type = rental?.rental_type === "sns" ? "SNS" : "通常";
      return `${rental?.order_number ?? ""} ${g}-${l} ${rental?.size} ${type}`.trim();
    }
    case "jersey_inventory_update": {
      const changes = snap.changes as unknown[] | undefined;
      return `在庫 ${changes?.length ?? 0} 件変更`;
    }
    case "jersey_cleaned": {
      const g = snap.group_code as string | undefined;
      const l = snap.item_label as string | undefined;
      const size = snap.size as string | undefined;
      const uses = snap.uses_before_clean as number | undefined;
      return `${g}-${l} ${size}（洗濯前 ${uses ?? "?"} 回）`;
    }
    case "ib_ticket_add":
      return "IBチケット追加";
    case "ib_ticket_edit":
      return "IBチケット修正";
    case "rollback":
      return `巻き戻し (${String(snap.original_action ?? "")})`;
    default:
      return row.action;
  }
}

export function formatLogTime(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
