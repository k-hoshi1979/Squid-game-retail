import type { Metadata } from "next";
import { JerseyPageShell } from "@/components/jerseys/JerseyPageShell";
import { InventoryForm } from "@/components/jerseys/InventoryForm";
import { fetchJerseyInventory } from "@/lib/retail/jerseys";

export const metadata: Metadata = { title: "ジャージレンタル：在庫" };
export const dynamic = "force-dynamic";

export default async function JerseyInventoryPage() {
  const groups = await fetchJerseyInventory();

  return (
    <JerseyPageShell title="ジャージレンタル：在庫">
      <InventoryForm groups={groups} />
    </JerseyPageShell>
  );
}
