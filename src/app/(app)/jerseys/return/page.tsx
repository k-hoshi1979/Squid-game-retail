import type { Metadata } from "next";
import { JerseyPageShell } from "@/components/jerseys/JerseyPageShell";
import { ReturnList } from "@/components/jerseys/ReturnList";
import { fetchUnreturnedRentals } from "@/lib/retail/jerseys";

export const metadata: Metadata = { title: "ジャージレンタル：返却" };
export const dynamic = "force-dynamic";

export default async function JerseyReturnPage() {
  const rentals = await fetchUnreturnedRentals();

  return (
    <JerseyPageShell title="ジャージレンタル：返却">
      <ReturnList rentals={rentals} />
    </JerseyPageShell>
  );
}
