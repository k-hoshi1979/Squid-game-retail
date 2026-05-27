"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getBusinessDateString } from "@/lib/retail/businessDate";
import type { IbTicketTotals } from "@/lib/retail/ibTicketTypes";
import type { IbTicketType } from "@/types/database";

async function requireUserId(): Promise<string | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };
  return user.id;
}

export async function addIbTicketsAction(
  deltas: { ticketType: IbTicketType; deltaCount: number }[],
): Promise<{ error?: string }> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  const payload = deltas
    .filter((d) => d.deltaCount > 0)
    .map((d) => ({
      ticket_type: d.ticketType,
      delta_count: d.deltaCount,
    }));

  if (payload.length === 0) {
    return { error: "追加する枚数を入力してください" };
  }

  const businessDate = getBusinessDateString();
  const supabase = await createClient();
  const { error } = await supabase.rpc("add_ib_tickets", {
    p_business_date: businessDate,
    p_deltas: payload,
    p_operator_id: userId,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/ib-tickets/add");
  revalidatePath("/ib-tickets/edit");

  return {};
}

export async function editIbTicketsAction(
  totals: IbTicketTotals,
): Promise<{ error?: string }> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  for (const val of Object.values(totals)) {
    if (val < 0) return { error: "枚数は0以上で入力してください" };
  }

  const businessDate = getBusinessDateString();
  const supabase = await createClient();
  const { error } = await supabase.rpc("edit_ib_tickets", {
    p_business_date: businessDate,
    p_totals: totals,
    p_operator_id: userId,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/ib-tickets/add");
  revalidatePath("/ib-tickets/edit");

  return {};
}
