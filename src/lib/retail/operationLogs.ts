import { createClient } from "@/lib/supabase/server";
import { getBusinessDateString } from "@/lib/retail/businessDate";
import type { OperationLogRow } from "@/lib/retail/operationLogUtils";
import type { RetailLogAction } from "@/types/database";

export type { OperationLogRow };

export async function fetchOperationLogs(
  businessDate?: string,
): Promise<OperationLogRow[]> {
  const date = businessDate ?? getBusinessDateString();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("retail_operation_logs")
    .select(`
      id, business_date, action, target_type, target_id, snapshot,
      performed_at, rolled_back_at, operator_id
    `)
    .eq("business_date", date)
    .order("performed_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    businessDate: row.business_date,
    action: row.action as RetailLogAction,
    targetType: row.target_type,
    targetId: row.target_id,
    snapshot: row.snapshot as Record<string, unknown>,
    performedAt: row.performed_at,
    rolledBackAt: row.rolled_back_at,
    operatorName: "",
  }));
}
