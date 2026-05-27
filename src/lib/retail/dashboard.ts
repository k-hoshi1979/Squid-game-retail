import { createClient } from "@/lib/supabase/server";
import { getBusinessDateString } from "@/lib/retail/businessDate";
import { countNeedsCleaning } from "@/lib/retail/jerseyCleaning";
import { flattenJerseyUsage } from "@/lib/retail/jerseyInventoryTypes";
import { fetchJerseyInventory } from "@/lib/retail/jerseys";

export type DashboardStats = {
  businessDate: string;
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
  /** 貸切VIP（平日/休日で料金が同じため独立表示） */
  ibVipCount: number;
  recentLogCount: number;
};

const EMPTY_IB_WEEKDAY = { gen: 0, child: 0, genVip: 0, childVip: 0 };
const EMPTY_IB_HOLIDAY = { gen: 0, child: 0, genVip: 0, childVip: 0 };

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const businessDate = getBusinessDateString();
  const supabase = await createClient();

  const [
    { data: rentals },
    { data: ibTotals },
    { count: unreturnedCount },
    { count: recentLogCount },
    inventoryGroups,
  ] = await Promise.all([
    supabase
      .from("jersey_rentals")
      .select("rental_type")
      .eq("business_date", businessDate)
      .in("status", ["rented", "returned"]),
    supabase
      .from("ib_ticket_daily_totals")
      .select("*")
      .eq("business_date", businessDate)
      .maybeSingle(),
    supabase
      .from("jersey_rentals")
      .select("*", { count: "exact", head: true })
      .eq("status", "rented"),
    supabase
      .from("retail_operation_logs")
      .select("*", { count: "exact", head: true })
      .eq("business_date", businessDate)
      .is("rolled_back_at", null),
    fetchJerseyInventory(),
  ]);

  let jerseyNormalCount = 0;
  let jerseySnsCount = 0;
  for (const row of rentals ?? []) {
    if (row.rental_type === "normal") jerseyNormalCount += 1;
    if (row.rental_type === "sns") jerseySnsCount += 1;
  }

  return {
    businessDate,
    jerseyNormalCount,
    jerseySnsCount,
    jerseyTotalCount: jerseyNormalCount + jerseySnsCount,
    unreturnedCount: unreturnedCount ?? 0,
    needsCleaningCount: countNeedsCleaning(flattenJerseyUsage(inventoryGroups)),
    ibWeekday: ibTotals
      ? {
          gen: ibTotals.gen_weekday_count,
          child: ibTotals.child_weekday_count,
          genVip: ibTotals.gen_vip_weekday_count,
          childVip: ibTotals.child_vip_weekday_count,
        }
      : EMPTY_IB_WEEKDAY,
    ibHoliday: ibTotals
      ? {
          gen: ibTotals.gen_holiday_count,
          child: ibTotals.child_holiday_count,
          genVip: ibTotals.gen_vip_holiday_count,
          childVip: ibTotals.child_vip_holiday_count,
        }
      : EMPTY_IB_HOLIDAY,
    ibVipCount: ibTotals?.vip_count ?? 0,
    recentLogCount: recentLogCount ?? 0,
  };
}
