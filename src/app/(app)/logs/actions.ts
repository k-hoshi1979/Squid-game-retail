"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUserId(): Promise<string | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です" };
  return user.id;
}

export async function rollbackOperationAction(
  logId: string,
): Promise<{ error?: string }> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  const supabase = await createClient();
  const { error } = await supabase.rpc("rollback_retail_operation", {
    p_log_id: logId,
    p_operator_id: userId,
  });

  if (error) return { error: error.message };

  revalidatePath("/logs");
  revalidatePath("/dashboard");
  revalidatePath("/jerseys/detail");
  revalidatePath("/jerseys/return");
  revalidatePath("/jerseys/rent");
  revalidatePath("/jerseys/inventory");
  revalidatePath("/ib-tickets/add");
  revalidatePath("/ib-tickets/edit");

  return {};
}
