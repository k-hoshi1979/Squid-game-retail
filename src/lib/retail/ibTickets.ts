import { createClient } from "@/lib/supabase/server";
import { getBusinessDateString } from "@/lib/retail/businessDate";
import { rowToTotals, type IbTicketTotals } from "@/lib/retail/ibTicketTypes";

export async function fetchIbTicketDailyTotals(
  businessDate?: string,
): Promise<{ businessDate: string; totals: IbTicketTotals }> {
  const date = businessDate ?? getBusinessDateString();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ib_ticket_daily_totals")
    .select("*")
    .eq("business_date", date)
    .maybeSingle();

  if (error) throw error;

  return {
    businessDate: date,
    totals: rowToTotals(data ?? undefined),
  };
}
