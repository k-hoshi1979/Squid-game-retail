import type { Metadata } from "next";
import { JerseyPageShell } from "@/components/jerseys/JerseyPageShell";
import { RentForm } from "@/components/jerseys/RentForm";
import { fetchJerseyInventory } from "@/lib/retail/jerseys";

export const metadata: Metadata = { title: "ジャージレンタル：貸出" };
export const dynamic = "force-dynamic";

export default async function JerseyRentPage() {
  const groups = await fetchJerseyInventory();

  return (
    <JerseyPageShell title="ジャージレンタル：貸出">
      <RentForm groups={groups} />
    </JerseyPageShell>
  );
}
