import { createClient } from "@/lib/supabase/server";
import { getBusinessDateString } from "@/lib/retail/businessDate";
import {
  emptySizes,
  type JerseyGroupInventory,
  type JerseySizeMap,
} from "@/lib/retail/jerseyInventoryTypes";
import type { JerseyRentalType, JerseySize } from "@/types/database";

export type {
  JerseyGroupInventory,
  JerseyItemInventory,
  JerseySizeInfo,
  JerseySizeMap,
  JerseyUsageRow,
} from "@/lib/retail/jerseyInventoryTypes";

export { flattenJerseyUsage } from "@/lib/retail/jerseyInventoryTypes";

export type UnreturnedRental = {
  id: string;
  orderNumber: string;
  rentedAt: string;
  sessionStartAt: string;
  size: JerseySize;
  rentalType: JerseyRentalType;
  groupCode: string;
  itemLabel: string;
};

export async function fetchJerseyInventory(): Promise<JerseyGroupInventory[]> {
  const supabase = await createClient();

  const { data: groups, error: groupsError } = await supabase
    .from("jersey_groups")
    .select("id, code, sort_order")
    .order("sort_order");

  if (groupsError) throw groupsError;

  const { data: items, error: itemsError } = await supabase
    .from("jersey_items")
    .select("id, group_id, label, sort_order")
    .order("sort_order");

  if (itemsError) throw itemsError;

  const { data: inventory, error: invError } = await supabase
    .from("jersey_inventory")
    .select("jersey_item_id, size, quantity, uses_since_clean, total_uses, last_cleaned_at");

  if (invError) throw invError;

  const invMap = new Map<string, JerseySizeMap>();
  for (const row of inventory ?? []) {
    if (!invMap.has(row.jersey_item_id)) {
      invMap.set(row.jersey_item_id, emptySizes());
    }
    const size = row.size as JerseySize;
    invMap.get(row.jersey_item_id)![size] = {
      quantity: row.quantity,
      usesSinceClean: row.uses_since_clean,
      totalUses: row.total_uses,
      lastCleanedAt: row.last_cleaned_at,
    };
  }

  return (groups ?? []).map((g) => ({
    code: g.code,
    sortOrder: g.sort_order,
    items: (items ?? [])
      .filter((i) => i.group_id === g.id)
      .map((i) => ({
        id: i.id,
        label: i.label,
        sortOrder: i.sort_order,
        sizes: invMap.get(i.id) ?? emptySizes(),
      })),
  }));
}

export async function fetchUnreturnedRentals(): Promise<UnreturnedRental[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jersey_rentals")
    .select(`
      id, order_number, rented_at, session_start_at, size, rental_type,
      jersey_items (
        label,
        jersey_groups ( code )
      )
    `)
    .eq("status", "rented")
    .order("rented_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const item = row.jersey_items as {
      label: string;
      jersey_groups: { code: string } | { code: string }[] | null;
    } | null;
    const group = item?.jersey_groups;
    const groupCode = Array.isArray(group) ? group[0]?.code : group?.code;

    return {
      id: row.id,
      orderNumber: row.order_number,
      rentedAt: row.rented_at,
      sessionStartAt: row.session_start_at,
      size: row.size as JerseySize,
      rentalType: row.rental_type as JerseyRentalType,
      groupCode: groupCode ?? "?",
      itemLabel: item?.label ?? "?",
    };
  });
}

export async function fetchTodayRentalCount(): Promise<number> {
  const businessDate = getBusinessDateString();
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("jersey_rentals")
    .select("*", { count: "exact", head: true })
    .eq("business_date", businessDate)
    .in("status", ["rented", "returned"]);

  if (error) throw error;
  return count ?? 0;
}

export { SIZES } from "@/lib/retail/jerseyUtils";
