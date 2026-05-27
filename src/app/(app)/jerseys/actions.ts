"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildSessionStartAt } from "@/lib/retail/jerseyUtils";
import { getBusinessDateString } from "@/lib/retail/businessDate";
import type { JerseyRentalType, JerseySize } from "@/types/database";

async function requireUserId(): Promise<string | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };
  return user.id;
}

export async function rentJerseyAction(input: {
  jerseyItemId: string;
  size: JerseySize;
  rentalType: JerseyRentalType;
  hour: number;
  minute: number;
}): Promise<{ error?: string; orderNumber?: string }> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  const businessDate = getBusinessDateString();
  const sessionStartAt = buildSessionStartAt(businessDate, input.hour, input.minute);

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rent_jersey", {
    p_jersey_item_id: input.jerseyItemId,
    p_size: input.size,
    p_rental_type: input.rentalType,
    p_session_start_at: sessionStartAt,
    p_operator_id: userId,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/jerseys/detail");
  revalidatePath("/jerseys/return");
  revalidatePath("/jerseys/rent");
  revalidatePath("/jerseys/inventory");

  return { orderNumber: data.order_number };
}

export async function returnJerseyAction(
  rentalId: string,
): Promise<{ error?: string }> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  const supabase = await createClient();
  const { error } = await supabase.rpc("return_jersey", {
    p_rental_id: rentalId,
    p_operator_id: userId,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/jerseys/detail");
  revalidatePath("/jerseys/return");
  revalidatePath("/jerseys/inventory");

  return {};
}

export async function markJerseyCleanedAction(input: {
  jerseyItemId: string;
  size: JerseySize;
}): Promise<{ error?: string }> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_jersey_cleaned", {
    p_jersey_item_id: input.jerseyItemId,
    p_size: input.size,
    p_operator_id: userId,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/jerseys/detail");
  revalidatePath("/logs");

  return {};
}

export async function updateInventoryAction(
  updates: { jerseyItemId: string; size: JerseySize; quantity: number }[],
): Promise<{ error?: string }> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  for (const u of updates) {
    if (u.quantity < 0) {
      return { error: "在庫数は0以上で入力してください" };
    }
  }

  const payload = updates.map((u) => ({
    jersey_item_id: u.jerseyItemId,
    size: u.size,
    quantity: u.quantity,
  }));

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_jersey_inventory", {
    p_updates: payload,
    p_operator_id: userId,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/jerseys/detail");
  revalidatePath("/jerseys/inventory");
  revalidatePath("/jerseys/rent");

  return {};
}
